import {
  geoJSON,
  latLngBounds,
  LatLngBounds,
  Map,
  tileLayer,
  LeafletMouseEvent,
  Popup,
  popup,
} from 'leaflet';
import { GeoJSON } from 'geojson';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
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
import { ContourDetailsComponent } from './components/contour-details/contour-details.component';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { MapControlLayersSwitchComponent } from '../../../ui/components/map-control-layers-switch/map-control-layers-switch.component';
import { ILandType } from 'src/modules/api/models/land-type.model';
import { IUser } from 'src/modules/api/models/user.model';

@Component({
  selector: 'app-cropland-map',
  templateUrl: './cropland-map.component.html',
  styleUrls: ['./cropland-map.component.scss'],
})
export class CroplandMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;
  @ViewChild('map') mapComponent!: MapComponent;
  @ViewChild('mapControls') mapControls!: MapControlLayersSwitchComponent;
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  @ViewChildren(ContourDetailsComponent)
  contourDetailsComponents!: QueryList<ContourDetailsComponent>;
  mode!: string;
  user: IUser | null = this.api.user.getLoggedInUser();
  landTypes: ILandType[] = [];
  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  currentLang: string = this.translateSvc.currentLang;
  currentRouterPathname: string = '';
  isWmsAiActive: boolean = false;
  productivity: string | null = null;
  wmsSelectedStatusLayers: Record<string, string> | null = null;
  selectedContourId!: number;
  loading: boolean = false;
  activeContour!: any;
  activeContourSmall: any;
  mapControlLayersSwitch: Record<string, any> = {};
  filterFormValues!: any;
  sidePanelData: Record<string, any> = {};
  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexOption[] = [];
  loadingSatelliteDates: boolean = false;
  activeVegIndexOption: IVegIndexOption | null = null;
  wmsLayerInfoPopup: Popup | null = null;

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
      title: 'Base Map',
      name: 'Base Map',
      layer: tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      ),
    },
  ];

  wmsLayers: ITileLayer[] = [
    {
      title: 'Base',
      name: 'contours_main',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:contours_main',
        ...this.wmsLayersOptions,
      }),
      type: 'radio',
    },
    {
      title: 'RSE',
      name: 'contours_main_ai',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:contours_main_ai',
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
      title: 'NDVI heat map',
      name: 'ndvi_heat_map',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:ndvi_heat_map',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Forestry',
      name: 'agromap:forestry',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:forestry',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'On-farm channels',
      name: 'agromap:Внутрихозяйственные_каналы',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:Внутрихозяйственные_каналы',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Inter-farm channels',
      name: 'agromap:Межхозяйственные_каналы',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:Межхозяйственные_каналы',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Tepke',
      name: 'agromap:Tepke_20cm(EPSG:7695)',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:Tepke_20cm(EPSG:7695)',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'AWU',
      name: 'agromap:АВП',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:АВП',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Regions borders',
      name: 'kyrgyz:Oblast',
      layer: tileLayer.wms('https://isul.forest.gov.kg/geoserver/kyrgyz/wms', {
        layers: 'kyrgyz:Oblast',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Districts borders',
      name: 'kyrgyz:Raion',
      layer: tileLayer.wms('https://isul.forest.gov.kg/geoserver/kyrgyz/wms', {
        layers: 'kyrgyz:Raion',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Karagana Suusamyr valley',
      name: 'agromap:Karagana_Suusamyr_Valley2020',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:Karagana_Suusamyr_Valley2020',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
    {
      title: 'Land shares of the Chui region',
      name: 'agromap:zemdoli',
      layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
        layers: 'agromap:zemdoli',
        ...this.wmsLayersOverlayOptions,
      }),
      type: 'checkbox',
    },
  ];

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
    const routerEventSub = this.router.events.subscribe((event: Event) => {
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
          const data = this.store.getItem<
            Record<string, LatLngBounds | number>
          >('ArableLandComponent');

          const layersLength = this.mapData.geoJson.getLayers().length;
          const zoom = data?.['mapZoom'] as number;
          const bounds = data?.['mapBounds'] as LatLngBounds;

          if (layersLength > 0) this.mapData.geoJson.clearLayers();
          if (bounds && zoom >= 12) this.addPolygonsInScreenToMap(bounds);
        }
      }
    });

    this.subscriptions.push(routerEventSub);
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

    this.store.watchItem('MapControlLayersSwitchComponent').subscribe((v) => {
      if (this.wmsLayerInfoPopup) {
        this.mapData?.map.removeLayer(this.wmsLayerInfoPopup);
        this.wmsLayerInfoPopup = null;
      }
      this.mapControlLayersSwitch = v;
    }),

    this.store.watchItem('SidePanelComponent').subscribe((v) => {
      this.sidePanelData = v;
      this.cd.detectChanges();
    }),
  ];

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
    this.contourDetailsComponents.map((c) => {
      if (c) c.isHidden = false;
    });
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

    if (this.activeVegIndexOption?.id) {
      this.getVegSatelliteDates(cid, this.activeVegIndexOption.id);
    }
    this.store.setItem<Feature>('selectedLayerFeature', layerFeature.feature);
    const bounds = geoJSON(layerFeature.feature).getBounds();
    if (this.mapData?.map) {
      this.mapData.map.fitBounds(bounds);
      this.mapService.invalidateSize(this.mapData.map);
    }
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.store.removeItem('selectedLayerFeature');
    if (this.selectedLayer) {
      this.selectedLayer.remove();
    }
    this.activeContour = null;
    this.activeVegIndexOption = this.vegIndexOptionsList[0];
    this.contourDetailsComponents.map((c) => {
      if (c) c.ngOnDestroy();
    });
    if (this.mapData?.map) this.mapService.invalidateSize(this.mapData.map);
  }

  hanldeVegIndexesDateSelect() {
    this.contourDetailsComponents.map((c) => {
      if (c) c.isHidden = true;
    });
  }

  handleSidePanelToggle(isOpened: boolean) {
    this.store.setItem('SidePanelComponent', { state: isOpened });
  }

  handleMapClick(e: LeafletMouseEvent) {
    if (this.mapComponent && this.activeContour != null) {
      this.mapComponent.handleFeatureClose();
    }

    this.handleWmsLayerPopup(e);
  }

  async handleWmsLayerPopup(e: LeafletMouseEvent) {
    const contolLayers = Object.values({
      ...this.mapControlLayersSwitch,
    });
    const activeControlLayer = [...contolLayers]
      .sort((a, b) => b?.updatedAt - a?.updatedAt)
      .filter((item) => item?.name && item?.updatedAt && item?.layersName)?.[0];

    if (activeControlLayer != null) {
      const layers = activeControlLayer?.layersName;
      if (layers == null) return;

      const { lat, lng } = e.latlng;
      const bbox = [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1];

      try {
        let data: any = null;
        if (layers.includes('agromap')) {
          data = await this.api.map.getFeatureInfo({
            bbox: bbox.join(','),
            layers: layers,
            query_layers: layers,
          });
        }

        const properties: any = data.features?.[0]?.properties;

        if (this.mapData?.map && properties != null) {
          const tooltipContent = `
          <div>
            ${Object.entries(properties)
              .map(([key, value]) => {
                if (
                  value &&
                  (typeof value === typeof '' || typeof value === typeof 0)
                ) {
                  return `<p><strong>${key}:</strong>  ${value}</p> `;
                }
                return null;
              })
              .filter(Boolean)
              .join('<hr>')}
          </div>
        `;

          const options = { maxHeight: 300, maxWidth: 300 };
          this.wmsLayerInfoPopup = popup(options)
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
    this.store.setItem<Record<string, LatLngBounds | number>>(
      'ArableLandComponent',
      {
        mapBounds: mapMove.bounds,
        mapZoom: mapMove.zoom,
      }
    );
    if (this.mapData?.map != null) {
      const layersLength = this.mapData.geoJson.getLayers().length;
      if (layersLength > 0) this.mapData.geoJson.clearLayers();
      if (mapMove.zoom >= 12) this.addPolygonsInScreenToMap(mapMove.bounds);
      if (mapMove.zoom < 12) this.activeContourSmall = null;
    }
  }

  handleFilterFormReset(): void {
    this.wmsCQLFilter = 'year' + new Date().getFullYear();
    this.setWmsParams();
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
    this.handleSetSidePanelState(false);
  }

  handleSetSidePanelState(state: boolean) {
    this.store.setItem('SidePanelComponent', { state });
  }

  handleFilterFormSubmit(formValue: Record<string, any>) {
    this.filterFormValues = formValue['value'];

    if (this.mapData?.map) {
      this.mapData.geoJson.clearLayers();
      const data = this.store.getItem<Record<string, LatLngBounds | number>>(
        'ArableLandComponent'
      );

      const bounds = data?.['mapBounds'] as LatLngBounds;
      const zoom = data?.['mapZoom'] as number;

      if (bounds) {
        const layersLength = this.mapData.geoJson.getLayers().length;
        if (layersLength > 0) this.mapData.geoJson.clearLayers();
        if (zoom >= 12) this.addPolygonsInScreenToMap(bounds);
      }
    }

    this.store.setItem('SidePanelComponent', { state: false });
    this.toggleBtn.isContentToggled = false;
    this.handleSetSidePanelState(false);
  }

  handleVegIndexOptionClick(vegIndexOption: IVegIndexOption) {
    this.activeVegIndexOption = vegIndexOption;
    const contourId =
      this.layerFeature?.feature?.properties?.['contour_id'] ??
      this.layerFeature?.feature?.properties?.['id'];

    if (this.activeVegIndexOption?.id && contourId) {
      this.getVegSatelliteDates(contourId, this.activeVegIndexOption.id);
    }
  }

  handleModeChange(mode: string | null) {
    if (this.mode === mode) {
      this.mode = '';
      this.cd.detectChanges();
    }
    this.mode = mode as string;
  }

  handleWmsLayerChanged(layer: ITileLayer | null): void {
    if (layer != null) {
      const finded = this.wmsLayers.find((l) => l.name === layer.name);
      if (finded != null && finded.name === 'contours_main_ai') {
        this.isWmsAiActive = true;
      } else {
        this.isWmsAiActive = false;
      }
      this.setWmsParams();
    }

    if (this.mapData?.map) {
      const data = this.store.getItem<Record<string, LatLngBounds | number>>(
        'ArableLandComponent'
      );
      const bounds = data?.['mapBounds'] as LatLngBounds;
      const zoom = data?.['mapZoom'] as number;

      if (this.mapComponent && this.activeContour != null) {
        this.mapComponent.handleFeatureClose();
      }

      if (this.mapComponent && this.activeContour != null) {
        this.mapComponent.handleFeatureClose();
      }

      if (bounds && this.mapData && this.landTypes.length > 0) {
        const layersLength = this.mapData.geoJson.getLayers().length;
        if (layersLength > 0) this.mapData.geoJson.clearLayers();
        if (zoom >= 12) this.addPolygonsInScreenToMap(bounds);
        this.cd.detectChanges();
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
    const data = this.store.getItem<Record<string, LatLngBounds | number>>(
      'ArableLandComponent'
    );

    const bounds = data?.['mapBounds'] as LatLngBounds;
    const zoom = data?.['mapZoom'] as number;

    if (bounds && this.mapData) {
      const layersLength = this.mapData.geoJson.getLayers().length;
      if (layersLength > 0) this.mapData.geoJson.clearLayers();
      if (zoom >= 12) this.addPolygonsInScreenToMap(bounds);
    }
  }

  async deleteItem(): Promise<void> {
    const id = this.layerFeature?.feature?.properties?.['id'];
    try {
      if (this.isWmsAiActive) {
        await this.api.aiContour.remove(Number(id));
      } else {
        await this.api.contour.remove(Number(id));
      }

      this.messages.success(
        this.translate.transform('Polygon successfully deleted')
      );
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private async getContour(id: number): Promise<void> {
    try {
      if (this.isWmsAiActive) {
        this.activeContour = await this.api.aiContour.getOne(id);
      } else {
        this.activeContour = await this.api.contour.getOne(id);
      }
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private async getContourData(id: number) {
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
      this.messages.error(e.error?.message ?? e.message);
      this.contourData = [];
    }
  }

  private async addPolygonsInScreenToMap(mapBounds: LatLngBounds) {
    this.loading = true;
    try {
      const year = this.filterFormValues?.['year'] ?? new Date().getFullYear();
      const culture = this.filterFormValues?.['culture'] ?? null;
      const land_type =
        this.filterFormValues?.['land_type'] ??
        this.landTypes.map((l: ILandType) => l['id']).join(',');

      if (this.mapData?.map != null && land_type) {
        let polygons: GeoJSON;
        if (this.isWmsAiActive) {
          polygons = await this.api.map.getPolygonsInScreenAi({
            latLngBounds: mapBounds,
            land_type,
            year,
            culture,
          });
        } else {
          polygons = await this.api.map.getPolygonsInScreen({
            latLngBounds: mapBounds,
            land_type,
            year,
            culture,
          });
        }
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
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }
  }

  private async getLandTypes() {
    try {
      this.landTypes = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private async getRegionsPolygon() {
    try {
      let polygons: IRegion[];
      polygons = await this.api.dictionary.getRegions({
        polygon: true,
      });

      polygons.map((polygon) => {
        if (this.mapData?.map != null) {
          this.mapData.geoJsonStatic.options.snapIgnore = true;
          this.mapData.geoJsonStatic.options.pmIgnore = true;
          this.mapData.geoJsonStatic.options.style = { fillOpacity: 0 };
          this.mapData.geoJsonStatic.options.interactive = false;
          this.mapData.geoJsonStatic.addData(polygon.polygon);
        }
      });
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number
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
      this.messages.error(e.error?.message ?? e.message);
    }
    this.loadingSatelliteDates = false;
  }

  private async getVegIndexList() {
    try {
      this.vegIndexOptionsList =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private setWmsParams(): void {
    if (this.isWmsAiActive) {
      const finded = this.wmsLayers.find(
        (w) => w.name === 'contours_main_ai'
      ) as any;
      if (finded != null) {
        delete finded.layer.wmsParams.cql_filter;
        if (this.wmsCQLFilter != null) {
          finded.layer.setParams({ cql_filter: this.wmsCQLFilter });
        }
      }
    } else {
      const finded = this.wmsLayers.find(
        (w) => w.name === 'contours_main'
      ) as any;
      if (finded != null) {
        delete finded.layer.wmsParams.cql_filter;
        if (this.wmsCQLFilter != null) {
          finded.layer?.setParams({ cql_filter: this.wmsCQLFilter });
        }
      }
    }
  }

  private buildWmsCQLFilter() {
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
              this.wmsCQLFilter += `clt in (${val})`;
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
              this.wmsCQLFilter += `ltype in (${val})`;
            } else {
              this.wmsCQLFilter += 'ltype=' + v.land_type;
            }
          }
          if (v.year) {
            const val = v.year;
            if (this.wmsCQLFilter.length > 0) {
              this.wmsCQLFilter += '&&';
            }

            this.wmsCQLFilter += 'year=' + val;
          }
          this.setWmsParams();
        }
      });
  }

  async ngOnInit(): Promise<void> {
    this.wmsSelectedStatusLayers = this.store.getItem(
      'MapControlLayersSwitchComponent'
    );
    const data = this.store.getItem('MapControlLayersSwitchComponent');
    this.wmsSelectedStatusLayers = data;

    this.activeVegIndexOption = this.vegIndexOptionsList[0];

    await this.getLandTypes();
    await this.getVegIndexList();

    this.buildWmsCQLFilter();
  }

  ngAfterViewInit(): void {
    this.getRegionsPolygon();
    this.mapControls.handleBaseLayerChange('FULL_KR_TCI');

    const data = this.store.getItem('ArableLandComponent');
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
