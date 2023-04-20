import { geoJSON, latLngBounds, LatLngBounds, Map, tileLayer } from 'leaflet';
import { GeoJSON } from 'geojson';
import {
  AfterViewInit,
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
import { MapService } from '../../../ui/services/map.service';
import { MessagesService } from '../../../ui/components/services/messages.service';
import { IChartData } from './components/spline-area-chart/spline-area-chart.component';
import { ActualVegQuery } from '../../../api/classes/veg-indexes';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, Event, ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/modules/ui/services/store.service';
import { Feature } from 'geojson';
import { MapComponent } from '../../../ui/components/map/map.component';
import { Subscription } from 'rxjs';
import { ActualVegIndexes } from 'src/modules/api/models/actual-veg-indexes';
import { ITileLayer } from 'src/modules/ui/models/map.model';
import { QuestionDialogComponent } from '../../../ui/components/question-dialog/question-dialog.component';
import { IRegion } from 'src/modules/api/models/region.model';
import { ContourFiltersQuery } from 'src/modules/api/models/contour.model';
import {
  IContourStatisticsProductivity,
  IContourStatisticsProductivityQuery,
  ICulutreStatisticsQuery,
} from 'src/modules/api/models/statistics.model';
import { ITableItem } from 'src/modules/ui/models/table.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;
  @ViewChild('map') mapComponent!: MapComponent;
  mode!: string;
  baseLayers: ITileLayer[] = [
    {
      title: 'Google Satellite',
      name: 'Google Satellite',
      layer: tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    },
    {
      title: 'Google Streets',
      name: 'Google Streets',
      layer: tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    },
    {
      title: 'Google Terrain',
      name: 'Google Terrain',
      layer: tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    },
    {
      title: 'Open Street Map',
      name: 'Open Street Map',
      layer: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
    },
  ];

  wmsCQLFilter: string | null = null;
  wmsLayersOptions = {
    format: 'image/png',
    transparent: true,
    zIndex: 500,
  };

  wmsLayersOverlayOptions = {
    format: 'image/png',
    transparent: true,
    zIndex: 499,
  };

  wmsLayers: ITileLayer[] = [
    {
      title: 'Base',
      name: 'agromap_store',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:agromap_store',
        ...this.wmsLayersOptions,
      }),
      type: 'radio',
    },
    {
      title: 'AI',
      name: 'agromap_store_ai',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:agromap_store_ai',
        ...this.wmsLayersOptions,
      }),
      type: 'radio',
    },
    {
      title: 'SoilLayer',
      name: 'soil_agromap',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:soil_agromap',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Productivity layer',
      name: 'my_test_store',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/my_testing/wms', {
        layers: 'my_testing:my_test_store',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
  ];

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  currentLang: string = this.translateSvc.currentLang;
  currentRouterPathname: string = '';
  isWmsAiActive: boolean = false;
  culture: any = null;
  productivity: string | null = null;
  contourPastureStatisticsProductivityTableItems: ITableItem[][] = [];
  contourCultureStatisticsProductivityTableItems: ITableItem[] = [];
  wmsSelectedStatusLayers: Record<string, string> | null = null;
  selectedContourId!: number;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private mapService: MapService,
    private messages: MessagesService,
    private store: StoreService,
    private translateSvc: TranslateService,
    private router: Router,
    private translate: TranslatePipe,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe((event: Event) =>
      event instanceof NavigationEnd
        ? (this.currentRouterPathname = router.url)
        : ''
    );
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
    this.getOneCulture(Number(cid));
    this.selectedContourId = Number(cid);
    this.productivity = layerFeature?.feature?.properties?.['productivity'];
    this.getContourData(cid);
    this.layerFeature = layerFeature;
    this.selectedLayer = geoJSON(this.layerFeature?.feature)
      .addTo(this.mapData?.map as Map)
      .setStyle({
        fillOpacity: 0,
        weight: 5,
        color: '#f6ab39',
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
    this.store.setItem<Record<string, LatLngBounds>>('HomeComponent', {
      mapBounds: mapMove.bounds,
    });
    if (this.mapData?.map != null) {
      this.mapData.geoJson.clearLayers();
      this.getRegionsPolygon();

      if (mapMove.zoom >= 12) {
        try {
          this.loading = true;
          let polygons: GeoJSON;
          if (this.isWmsAiActive) {
            polygons = await this.api.map.getPolygonsInScreenAi(mapMove.bounds);
          } else {
            polygons = await this.api.map.getPolygonsInScreen(mapMove.bounds);
          }
          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.options.style = { fillOpacity: 0, weight: 0.4 };
          this.mapData.geoJson.setZIndex(400);
          this.mapData.geoJson.options.interactive = true;
          this.mapData.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async getRegionsPolygon() {
    try {
      let polygons: IRegion[];
      polygons = await this.api.dictionary.getRegions({
        polygon: true,
      });

      polygons.map((polygon) => {
        if (this.mapData?.map != null) {
          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.options.style = { fillOpacity: 0 };
          this.mapData.geoJson.options.interactive = false;
          this.mapData.geoJson.addData(polygon.polygon);
        }
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  async getOneCulture(id: number) {
    try {
      this.culture = await this.api.culture.getOne(id);
    } catch (e) {
      console.log(e);
    }
  }

  handleFilterFormReset(): void {
    this.getPastureStatisticsProductivity({
      land_type: '2',
      year: 2022,
    });

    this.getCultureStatisticsProductivity({
      land_type: '1',
      year: 2022,
    });

    this.wmsCQLFilter = null;
    this.setWmsParams();
  }

  handleFilterFormSubmit(formValue: Record<string, any>) {
    this.getPastureStatisticsProductivity(formValue['value']);
    this.getCultureStatisticsProductivity(formValue['value']);
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

  handleModeChange(mode: string | null) {
    this.mode = mode as string;
  }

  handleWmsLayerChanged(layer: ITileLayer | null): void {
    this.mapData?.geoJson.clearLayers();
    this.getRegionsPolygon();
    if (layer != null) {
      const finded = this.wmsLayers.find((l) => l.name === layer.name);
      if (finded != null && finded.name === 'agromap_store_ai') {
        this.isWmsAiActive = true;
      } else {
        this.isWmsAiActive = false;
      }
    }
  }

  handleEditClick(map: MapComponent) {
    const id = this.layerFeature?.feature?.properties?.['id'];
    this.router.navigate(['contour-edit', id], { relativeTo: this.route });
    map.handleFeatureClose();
    this.handleFeatureClose();
  }

  async handleDeleteSubmitted(
    dialog: QuestionDialogComponent,
    map: MapComponent
  ): Promise<void> {
    await this.deleteItem();
    dialog.close();
    map.handleFeatureClose();
    this.mapData?.map.fitBounds(this.mapService.maxBounds);
    this.mapData?.map.setMaxBounds(this.mapService.maxBounds);
  }

  async deleteItem(): Promise<void> {
    const id = this.layerFeature?.feature?.properties?.['id'];
    try {
      await this.api.contour.remove(Number(id));
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getPastureStatisticsProductivity(
    query: IContourStatisticsProductivityQuery
  ): Promise<void> {
    this.contourPastureStatisticsProductivityTableItems = [];
    if (!query.land_type.split(',').includes('2')) return;
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;

    try {
      let res: IContourStatisticsProductivity;
      res = await this.api.statistics.getPastureStatisticsProductivity({
        ...query,
        land_type: '2',
      });

      if (!res.type) {
        this.contourPastureStatisticsProductivityTableItems = [];
        return;
      }

      this.contourPastureStatisticsProductivityTableItems.push([
        {
          areaType: res?.type,
          areaName_en: res?.[`name_en`],
          areaName_ky: res?.[`name_ky`],
          areaName_ru: res?.[`name_ru`],
          productive: res?.Productive?.ha,
          unproductive: res?.Unproductive?.ha,
        },
      ]);

      if (Array.isArray(res?.Children) && res?.Children?.length > 0) {
        this.contourPastureStatisticsProductivityTableItems.push(
          res?.Children.map((child) => ({
            areaType: child?.type,
            areaName_en: child?.[`name_en`],
            areaName_ky: child?.[`name_ky`],
            areaName_ru: child?.[`name_ru`],
            productive: child?.Productive?.ha,
            unproductive: child?.Unproductive?.ha,
          }))
        );
      }
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getCultureStatisticsProductivity(
    query: ICulutreStatisticsQuery
  ): Promise<void> {
    this.contourCultureStatisticsProductivityTableItems = [];
    if (!query.land_type.split(',').includes('1')) return;
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;

    try {
      const res = await this.api.statistics.getCultureStatistics({
        ...query,
        land_type: '1',
      });

      this.contourCultureStatisticsProductivityTableItems =
        res as unknown as ITableItem[];
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  private setWmsParams(): void {
    if (this.isWmsAiActive) {
      const finded = this.wmsLayers.find(
        (w) => w.name === 'agromap_store_ai'
      ) as any;
      if (finded != null) {
        delete finded.layer.wmsParams.cql_filter;
        if (this.wmsCQLFilter != null) {
          finded.layer.setParams({ cql_filter: this.wmsCQLFilter });
        }
      }
    } else {
      const finded = this.wmsLayers.find(
        (w) => w.name === 'agromap_store'
      ) as any;
      if (finded != null) {
        delete finded.layer.wmsParams.cql_filter;
        if (this.wmsCQLFilter != null) {
          finded.layer?.setParams({ cql_filter: this.wmsCQLFilter });
        }
      }
    }
  }

  ngOnInit(): void {
    this.getPastureStatisticsProductivity({
      land_type: '2',
      year: 2022,
    });

    this.getCultureStatisticsProductivity({
      land_type: '1',
      year: 2022,
    });

    this.wmsSelectedStatusLayers = this.store.getItem(
      'MapControlLayersSwitchComponent'
    );
    const data = this.store.getItem('MapControlLayersSwitchComponent');
    this.wmsSelectedStatusLayers = data;
    this.getVegIndexList();
    this.store
      .watchItem<ContourFiltersQuery | null>('ContourFilterComponent')
      .subscribe((v) => {
        if (v != null) {
          this.wmsCQLFilter = '';
          if (v.region) {
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }
            this.wmsCQLFilter += 'rgn=' + v.region;
          }
          if (v.district) {
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }
            this.wmsCQLFilter += 'dst=' + v.district;
          }
          if (v.conton) {
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }
            this.wmsCQLFilter += 'cntn=' + v.conton;
          }
          if (v.culture) {
            const val = v.culture;
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }
            if (typeof val === 'string' && val.split(',').length > 1) {
              this.wmsCQLFilter += val
                .split(',')
                .reduce((acc, i) => (acc += 'clt=' + i + ' OR '), '')
                .slice(0, -3)
                .trim();
            } else {
              this.wmsCQLFilter += 'clt=' + v.culture;
            }
          }
          if (v.land_type) {
            const val = v.land_type;
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }
            if (typeof val === 'string' && val.split(',').length > 1) {
              this.wmsCQLFilter += val
                .split(',')
                .reduce((acc, i) => (acc += 'ltype=' + i + ' OR '), '')
                .slice(0, -3)
                .trim();
            } else {
              this.wmsCQLFilter += 'ltype=' + v.land_type;
            }
          }
          this.setWmsParams();
        }
      });
  }

  ngAfterViewInit(): void {
    this.getRegionsPolygon();

    const data = this.store.getItem('HomeComponent');
    if (data !== null) {
      const newBounds = latLngBounds(
        data.mapBounds._southWest,
        data.mapBounds._northEast
      );

      if (newBounds) {
        this.mapData?.map.flyToBounds(newBounds, {
          duration: 1.6,
        });
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
