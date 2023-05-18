import {
  geoJSON,
  latLngBounds,
  LatLngBounds,
  Map,
  tileLayer,
  LeafletMouseEvent,
  Tooltip,
  tooltip,
} from 'leaflet';
import { GeoJSON, FeatureCollection } from 'geojson';
import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { MessagesService } from '../../../ui/services/messages.service';
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
} from 'src/modules/api/models/statistics.model';
import { ITableItem } from 'src/modules/ui/models/table.model';
import { ContourDetailsComponent } from './components/contour-details/contour-details.component';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { MapControlLayersSwitchComponent } from '../../../ui/components/map-control-layers-switch/map-control-layers-switch.component';
import { ILandType } from 'src/modules/api/models/land-type.model';

@Component({
  selector: 'app-pastures-map',
  templateUrl: './pastures-map.component.html',
  styleUrls: ['./pastures-map.component.scss'],
})
export class PasturesMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;
  @ViewChild('map') mapComponent!: MapComponent;
  @ViewChild('contourDetails') contourDetails!: ContourDetailsComponent;
  @ViewChild('mapControls') mapControls!: MapControlLayersSwitchComponent;
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  mode!: string;
  pastureLayerProductivityTooltip: Tooltip | null = null;

  wmsProductivityLayerColorLegend: Record<string, any>[] = [
    { label: '-1', color: '#000000' },
    { label: '0.055', color: '#800000' },
    { label: '0.075', color: '#ff0000' },
    { label: '0.16', color: '#FFEA00' },
    { label: '0.401', color: '#359b52' },
    { label: '1', color: '#004529' },
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

  baseLayers: ITileLayer[] = [
    {
      title: 'Satellite map',
      name: 'FULL_KR_TCI',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:FULL_KR_TCI',
        ...this.wmsLayersOverlayOptions,
        zIndex: 400,
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
    {
      title: this.translate.transform('Base Map'),
      name: 'Base Map',
      layer: tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      ),
    },
  ];

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
      title: 'Productivity layer',
      name: 'productivity',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:productivity',
        ...{ ...this.wmsLayersOverlayOptions, zIndex: 1000 },
      }),
      type: 'checkbox',
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
      title: 'NDVI heat map',
      name: 'ndvi_heat_map',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:ndvi_heat_map',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
  ];

  landTypes: ILandType[] = [];

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  currentLang: string = this.translateSvc.currentLang;
  currentRouterPathname: string = '';
  isWmsAiActive: boolean = false;
  productivity: string | null = null;
  contourPastureStatisticsProductivityTableItems: ITableItem[][] = [];
  wmsSelectedStatusLayers: Record<string, string> | null = null;
  selectedContourId!: number;
  loading: boolean = false;
  activeContour!: any;
  activeContourSmall: any;
  sidePanelData: Record<string, any> = {};
  pasturesMapControlLayersSwitch: Record<string, any> = {};
  filterFormValues!: any;

  constructor(
    private api: ApiService,
    private mapService: MapService,
    private messages: MessagesService,
    private store: StoreService,
    private translateSvc: TranslateService,
    private router: Router,
    private translate: TranslatePipe,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRouterPathname = router.url;
        const isChildRoute = this.route.firstChild !== null;
        if (
          isChildRoute &&
          this.mapComponent &&
          this.activeContour != null &&
          !this.currentRouterPathname.includes('split-map')
        ) {
          this.mapComponent.handleFeatureClose();
        }

        if (this.mapData?.map && !isChildRoute && this.mapData?.geoJson) {
          this.mapData.geoJson.clearLayers();
          const data =
            this.store.getItem<Record<string, LatLngBounds>>('HomeComponent');
          if (data?.['mapBounds']) {
            this.addPolygonsInScreenToMap(data?.['mapBounds']);
          }
        }
      }
    });
  }

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe((res) => {
      this.currentLang = res.lang;
      const translateHa =
        this.translateSvc.translations[this.currentLang]['ha'];

      this.contourPastureStatisticsProductivityTableItems =
        this.contourPastureStatisticsProductivityTableItems.map((arr) =>
          arr.map((element) => ({
            ...element,
            productive: `${String(element?.['productive']).replace(
              /га|ha/gi,
              translateHa
            )}`,
            unproductive: `${String(element?.['unproductive']).replace(
              /га|ha/gi,
              translateHa
            )}`,
          }))
        );
    }),

    this.mapService.contourEditingMode.subscribe((res) => {
      if (res) {
        this.mapComponent.removeSubscriptions();
      } else {
        this.mapComponent.handleMapEventSubscription();
      }
    }),

    this.store
      .watchItem('PasturesMapControlLayersSwitchComponent')
      .subscribe((v) => {
        if (this.pastureLayerProductivityTooltip) {
          this.mapData?.map.removeLayer(this.pastureLayerProductivityTooltip);
          this.pastureLayerProductivityTooltip = null;
        }
        this.pasturesMapControlLayersSwitch = v;
      }),

    this.store.watchItem('SidePanelComponent').subscribe((v) => {
      this.sidePanelData = v;
      this.cd.detectChanges();
    }),
  ];

  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexOption[] = [];
  loadingSatelliteDates: boolean = false;

  handleMapData(mapData: MapData): void {
    this.mapData = mapData;
    this.mapService.map.next(mapData);
  }

  async handleFeatureMouseOver(layerFeature: MapLayerFeature) {
    const l = layerFeature.layer as any;
    l.setStyle({
      color: '#fff',
      weight: 3,
    });
    this.activeContourSmall = {
      culture: layerFeature?.feature?.properties?.['culture'],
      area_ha: layerFeature?.feature?.properties?.['area_ha'],
      contour_id: layerFeature?.feature?.properties?.['id'],
    };
  }

  handleFeatureMouseLeave(layerFeature: MapLayerFeature) {
    const l = layerFeature.layer as any;
    l.setStyle({
      color: 'rgba(51,136,255,0.5)',
      weight: 1,
    });
    this.activeContourSmall = null;
  }

  async handleFeatureClick(layerFeature: MapLayerFeature): Promise<void> {
    this.contourDetails.isHidden = false;
    if (this.layerFeature) {
      this.selectedLayer.remove();
    }
    const cid =
      layerFeature?.feature?.properties?.['contour_id'] ??
      layerFeature?.feature?.properties?.['id'];
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
    await this.getContour(Number(cid));

    this.getVegSatelliteDates(cid);
    this.store.setItem<Feature>(
      'PasturesMapSelectedLayerFeature',
      layerFeature.feature
    );
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.store.removeItem('PasturesMapSelectedLayerFeature');
    if (this.selectedLayer) {
      this.selectedLayer.remove();
    }
    this.activeContour = null;
    this.contourDetails.ngOnDestroy();
  }

  async getContour(id: number): Promise<void> {
    try {
      this.activeContour = await this.api.contour.getOne(id);
    } catch (e) {
      console.log(e);
    }
  }

  handleSidePanelToggle(isOpened: boolean) {
    this.store.setItem('SidePanelComponent', { state: isOpened });
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

  async handleMapClick(e: LeafletMouseEvent) {
    if (this.mapComponent && this.activeContour != null) {
      this.mapComponent.handleFeatureClose();
    }
  }

  async handleMapMousemove(e: LeafletMouseEvent) {
    if (this.pastureLayerProductivityTooltip) {
      this.mapData?.map.removeLayer(this.pastureLayerProductivityTooltip);
      this.pastureLayerProductivityTooltip = null;
    }
    if (this.pasturesMapControlLayersSwitch?.['productivity']?.name) {
      const { lat, lng } = e.latlng;
      const bbox = [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1];

      try {
        const data = await this.api.map.getFeatureInfo({
          service: 'WMS',
          request: 'GetFeatureInfo',
          srs: 'EPSG:4326',
          styles: '',
          format: 'image/png',
          bbox: bbox.join(','),
          layers: 'agromap:productivity',
          query_layers: 'agromap:productivity',
          transparent: true,
          width: 101,
          height: 101,
          x: 50,
          y: 50,
          version: '1.1.1',
          info_format: 'application/json',
        });

        const gray_index = (
          data as FeatureCollection
        )?.features?.[0]?.properties?.['GRAY_INDEX']?.toFixed(2);

        if (this.mapData?.map && gray_index != null) {
          const tooltipContent = `${this.translate.transform(
            'Productivity'
          )}: ${gray_index}`;

          this.pastureLayerProductivityTooltip = tooltip()
            .setLatLng(e.latlng)
            .setContent(tooltipContent)
            .openOn(this.mapData.map);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    this.store.setItem<Record<string, LatLngBounds>>('HomeComponent', {
      mapBounds: mapMove.bounds,
    });
    if (this.mapData?.map != null) {
      this.mapData.geoJson.clearLayers();
      this.getRegionsPolygon();
      this.addPolygonsInScreenToMap(mapMove.bounds);

      if (mapMove.zoom < 12) this.activeContourSmall = null;
    }
  }

  async addPolygonsInScreenToMap(mapBounds: LatLngBounds) {
    this.loading = true;
    try {
      if (this.mapData?.map != null) {
        const zoom = this.mapData.map.getZoom();

        if (zoom >= 12) {
          const landTypeParam = this.landTypes[0]?.['id'];

          let polygons: GeoJSON;

          polygons = await this.api.map.getPolygonsInScreen({
            latLngBounds: mapBounds,
            land_type: landTypeParam,
          });

          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.options.style = {
            fillOpacity: 0,
            weight: 0.4,
          };

          this.mapData.geoJson.setZIndex(400);
          this.mapData.geoJson.options.interactive = true;
          this.mapData.geoJson.addData(polygons);
        }
      }
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
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

  handleFilterFormReset(): void {
    this.getPastureStatisticsProductivity({
      land_type: '2',
      year: 2022,
    });

    this.wmsCQLFilter = null;
    this.setWmsParams();
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
  }

  handleFilterFormSubmit(formValue: Record<string, any>) {
    this.filterFormValues = formValue['value'];

    this.getPastureStatisticsProductivity(formValue['value']);
    this.store.setItem('SidePanelComponent', { state: false });
    this.toggleBtn.isContentToggled = false;
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

  handleEditClick() {
    const id = this.layerFeature?.feature?.properties?.['id'];
    this.router.navigate(['contour-edit', id], { relativeTo: this.route });
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
  }

  async handleDeleteSubmitted(dialog: QuestionDialogComponent): Promise<void> {
    await this.deleteItem();
    dialog.close();
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
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
      res = await this.api.statistics.getContourStatisticsProductivity({
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
          productive: `${res?.Productive?.ha} ${this.translate.transform(
            'ha'
          )}`,
          unproductive: `${res?.Unproductive?.ha} ${this.translate.transform(
            'ha'
          )}`,
        },
      ]);

      if (Array.isArray(res?.Children) && res?.Children?.length > 0) {
        this.contourPastureStatisticsProductivityTableItems.push(
          res?.Children.map((child) => ({
            areaType: child?.type,
            areaName_en: child?.[`name_en`],
            areaName_ky: child?.[`name_ky`],
            areaName_ru: child?.[`name_ru`],
            productive: `${child?.Productive?.ha} ${this.translate.transform(
              'ha'
            )}`,
            unproductive: `${
              child?.Unproductive?.ha
            } ${this.translate.transform('ha')}`,
          }))
        );
      }
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  private setWmsParams(): void {
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

  async getLandTypes() {
    try {
      this.landTypes = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async ngOnInit(): Promise<void> {
    const data = this.store.getItem('PasturesMapControlLayersSwitchComponent');
    if (!data) {
      this.mode = 'agromap_store';
    }

    this.wmsSelectedStatusLayers = data;

    await this.getLandTypes();

    this.getVegIndexList();

    this.getPastureStatisticsProductivity({
      land_type: String(this.landTypes[0].id),
      year: 2022,
    });

    this.wmsCQLFilter = `ltype=${String(this.landTypes[0].id)}`;
    this.setWmsParams();

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
    this.mapControls.handleBaseLayerChange('FULL_KR_TCI');

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
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
