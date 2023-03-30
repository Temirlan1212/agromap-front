import { geoJSON, Map, TileLayer, tileLayer } from 'leaflet';
import { GeoJSON } from 'geojson';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import {
  IVegIndexOption,
  IVegSatelliteDate,
} from 'src/modules/api/models/veg-indexes.model';
import {
  MapData,
  MapLayerFeature,
  MapMove,
} from 'src/modules/ui/models/map.model';
import { MapService } from './map.service';
import { MessagesService } from '../../../ui/components/services/messages.service';
import { IChartData } from './components/spline-area-chart/spline-area-chart.component';
import { ActualVegQuery } from '../../../api/classes/veg-indexes';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { StoreService } from 'src/modules/api/store.service';
import { Feature } from 'geojson';
import { MapComponent } from '../../../ui/components/map/map.component';
import { Subscription } from 'rxjs';
import { ActualVegIndexes } from 'src/modules/api/models/actual-veg-indexes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;
  @ViewChild('map') mapComponent!: MapComponent;

  wms: TileLayer.WMS = tileLayer.wms(
    'https://geoserver.24mycrm.com/agromap/wms',
    {
      layers: 'agromap:agromap_store',
      format: 'image/png',
      transparent: true,
      zIndex: 500,
    }
  );
  wmsAi: TileLayer.WMS = tileLayer.wms(
    'https://geoserver.24mycrm.com/agromap/wms',
    {
      layers: 'agromap:agromap_store_ai',
      format: 'image/png',
      transparent: true,
      zIndex: 500,
    }
  );

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  currentLang: string = this.translateSvc.currentLang;
  currentRouterPathname: string = ""
  isWmsAiActive: boolean = false;
  imageOverlayIncstance: L.ImageOverlay | null = null;

  constructor(
    private api: ApiService,
    private mapService: MapService,
    private messages: MessagesService,
    private store: StoreService,
    private translateSvc: TranslateService, private router: Router) {
    this.router.events.subscribe((event: Event) => event instanceof NavigationEnd ? this.currentRouterPathname = router.url : "");
    this.translateSvc.onLangChange.subscribe(res => this.currentLang = res.lang);
  }

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
    this.mapService.contourEditingMode.subscribe((res) => {
      if (res) {
        this.mapComponent.removeSubscriptions();
      } else {
        this.mapComponent.handleMapEventSubscription();
      }
    }),
  ];

  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexOption[] = [];
  loadingSatelliteDates: boolean = false;

  handleMapData(mapData: MapData): void {
    mapData.map.addLayer(this.wms);
    this.mapData = mapData;
    this.mapService.map.next(mapData);
  }

  handleFeatureClick(layerFeature: MapLayerFeature): void {
    if (this.layerFeature) {
      this.selectedLayer.remove();
    }
    const cid =
      layerFeature?.feature?.properties?.['contour_id'] ??
      layerFeature?.feature?.properties?.['id'];
    this.getContourData(cid);
    this.layerFeature = layerFeature;
    this.selectedLayer = geoJSON(this.layerFeature?.feature)
      .addTo(this.mapData?.map as Map)
      .setStyle({
        fillOpacity: 1,
        fillColor: '#f6ab39',
      });
    
    this.getVegSatelliteDates(cid);
    this.store.setItem<Feature>('selectedLayerFeature', layerFeature.feature);
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.store.removeItem('selectedLayerFeature');
    if (this.selectedLayer) {
      this.selectedLayer.remove();
    }
    if(this.imageOverlayIncstance) {
      this.mapData?.map.removeLayer(this.imageOverlayIncstance)
    }
  }

  async getContourData(id: number) {
    const query: ActualVegQuery = { contour_id: id };
    try {
      let res: ActualVegIndexes[];
      if (this.isWmsAiActive) {
        res = await this.api.vegIndexes.getActualVegIndexesAi(query);
      } else {
        res = await this.api.vegIndexes.getActualVegIndexes(query);
      }

      const data = res?.reduce((acc: any, i: any) => {
        if (!acc[i.index.id]) {
          acc[i.index.id] = {};
          acc[i.index.id]['name'] = i.index[`name_${this.currentLang}`];
          acc[i.index.id]['data'] = [];
          acc[i.index.id]['dates'] = [];
          acc[i.index.id]['data'].push(i.average_value);
          acc[i.index.id]['dates'].push(i.date);
        } else {
          acc[i.index.id]['data'].push(i.average_value);
          acc[i.index.id]['dates'].push(i.date);
        }
        return acc;
      }, {});
      this.contourData = data ? Object.values(data) : [];
    } catch (e: any) {
      this.messages.error(e.message);
      this.contourData = [];
    }
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    if (this.mapData?.map != null) {
      this.mapData.geoJson.clearLayers();

      if (mapMove.zoom >= 12) {
        try {
          let polygons: GeoJSON;
          if (this.isWmsAiActive) {
            polygons = await this.api.map.getPolygonsInScreenAi(mapMove.bounds);
          } else {
            polygons = await this.api.map.getPolygonsInScreen(mapMove.bounds);
          }
          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        }
      }
    }
  }

  async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number = 1
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    try {
      const query = {
        contourId: contoruId,
        vegIndexId: vegIndexId,
      };
      let res: IVegSatelliteDate[];
      if (this.isWmsAiActive) {
        res = await this.api.vegIndexes.getVegSatelliteDatesAi(query);
      } else {
        res = await this.api.vegIndexes.getVegSatelliteDates(query);
      }
      this.vegIndexesData = res;
    } catch (e: any) {
      console.log(e);
    }
    this.loadingSatelliteDates = false;
  }

  async getVegIndexList() {
    try {
      this.vegIndexOptionsList =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      console.log(e);
    }
  }

  handleVegIndexOptionClick(vegIndexOption: IVegIndexOption) {
    this.getVegSatelliteDates(
       this.layerFeature?.feature?.properties?.['contour_id'] ??
      this.layerFeature?.feature?.properties?.['id'],
      vegIndexOption.id
    );
  }

  handleMapControlAi(isActive: boolean): void {
    this.isWmsAiActive = isActive;
    if (isActive) {
      this.mapData?.map.removeLayer(this.wms);
    } else {
      this.mapData?.map.addLayer(this.wms);
    }
  }

  handleImageOverlayIncstance(value: L.ImageOverlay) {
    this.imageOverlayIncstance = value;
  }

  ngOnInit(): void {
    this.getVegIndexList();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
