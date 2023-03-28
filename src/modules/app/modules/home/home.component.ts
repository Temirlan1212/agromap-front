import { geoJSON, Map, TileLayer, tileLayer } from 'leaflet';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;

  wms: TileLayer = tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
    layers: 'agromap:agromap_store',
    format: 'image/png',
    transparent: true,
    zIndex: 500,
  });

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  layerContourId: string = '';
  currentLang: string = this.translateSvc.currentLang;

  constructor(
    private api: ApiService,
    private mapService: MapService,
    private messages: MessagesService,
    private translateSvc: TranslateService) {
    this.translateSvc.onLangChange.subscribe(res => this.currentLang = res.lang);
  }

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
    const cid = layerFeature?.feature?.properties?.['contour_id'] ?? layerFeature?.feature?.properties?.['id'];
    this.getContourData(cid);
    this.layerFeature = layerFeature;
    this.selectedLayer = geoJSON(this.layerFeature?.feature).addTo(this.mapData?.map as Map)
      .setStyle({
        fillOpacity: 1,
        fillColor: '#f6ab39',
      });
    this.layerContourId =
      this.layerFeature.feature.properties?.['id'].toString();

    this.getVegSatelliteDates(this.layerContourId);
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.selectedLayer.remove();
  }

  async getContourData(id: number) {
    const query: ActualVegQuery = { contour_id: id };
    try {
      const res = await this.api.vegIndexes.getActualVegIndexes(query);
      const data = res.reduce((acc: any, i: any) => {
        if (!acc[i.index.id]) {
          acc[i.index.id] = {};
          acc[i.index.id]['name'] = i.index[`name_${ this.currentLang }`];
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
      this.contourData = Object.values(data);
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
          const polygons = await this.api.map.getPolygonsInScreen(
            mapMove.bounds
          );
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
    contoruId: string,
    vegIndexId: string = '1'
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    try {
      this.vegIndexesData = (await this.api.vegIndexes.getVegSatelliteDates({
        contourId: contoruId,
        vegIndexId: vegIndexId,
      })) as IVegSatelliteDate[];
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
      this.layerContourId,
      vegIndexOption.id.toString()
    );
  }

  ngOnInit(): void {
    this.getVegIndexList();
  }
}
