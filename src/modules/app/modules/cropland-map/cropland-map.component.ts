import {
  geoJSON,
  latLngBounds,
  LatLngBounds,
  Map,
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
import { IChartData } from './components/spline-area-chart/spline-area-chart.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, Event, ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/modules/ui/services/store.service';
import { Feature } from 'geojson';
import { MapComponent } from '../../../ui/components/map/map.component';
import { Subscription } from 'rxjs';
import { ITileLayer } from 'src/modules/ui/models/map.model';
import { QuestionDialogComponent } from '../../../ui/components/question-dialog/question-dialog.component';
import { ContourFiltersQuery } from 'src/modules/api/models/contour.model';
import { ContourDetailsComponent } from './components/contour-details/contour-details.component';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { MapControlLayersSwitchComponent } from '../../../ui/components/map-control-layers-switch/map-control-layers-switch.component';
import { ILandType } from 'src/modules/api/models/land-type.model';
import { IUser } from 'src/modules/api/models/user.model';
import { SidePanelService } from 'src/modules/ui/services/side-panel.service';
import {
  baseLayers,
  wmsLayers,
  wmsProductivityLayerColorLegend,
  storageNames,
} from './lib/_constants';
import { buildWmsCQLFilter, buildWmsPopup } from './lib/_helpers';
import { ApiController } from './lib/controllers/api-controller';

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

  //components
  contourDetailsComponents!: QueryList<ContourDetailsComponent>;

  //loadings
  loadingSatelliteDates: boolean = false;
  loading: boolean = false;

  //mode
  mode!: string;
  isWmsAiActive: boolean = false;

  //constants
  wmsProductivityLayerColorLegend: Record<string, any>[] = [];
  baseLayers: ITileLayer[] = [];
  wmsLayers: ITileLayer[] = [];
  storageName = '';

  //dictionaries
  landTypes: ILandType[] = [];
  activeVegIndexOption: IVegIndexOption | null = null;
  sidePanelData: Record<string, any> = {};
  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexOption[] = [];
  mapControlLayersSwitch: Record<string, any> = {};

  //user
  user: IUser | null = this.api.user.getLoggedInUser();

  //map
  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];
  productivity: string | null = null;
  wmsSelectedStatusLayers: Record<string, string> | null = null;
  selectedContourId!: number;
  activeContour!: any;
  activeContourSmall: any;

  //map-popups
  wmsLayerInfoPopup: Popup | null = null;

  //settings
  currentLang: string = this.translateSvc.currentLang;
  currentRouterPathname: string = '';

  //filter
  wmsCQLFilter: string | null = null;
  filterFormValues!: any;

  //requests
  polygonsRequestController: AbortController | null = null;

  constructor(
    private api: ApiService,
    private mapService: MapService,
    private store: StoreService,
    private translateSvc: TranslateService,
    private router: Router,
    private translate: TranslatePipe,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private apiController: ApiController,
    public sidePanelService: SidePanelService
  ) {
    this.wmsProductivityLayerColorLegend = wmsProductivityLayerColorLegend;
    this.baseLayers = baseLayers;
    this.wmsLayers = wmsLayers;
    this.storageName = storageNames.mapControlLayersSwitchComponent;

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
          >(storageNames.arableLandComponent);

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

    this.mapService.loading.subscribe((loading) => (this.loading = loading)),

    this.store
      .watchItem(storageNames.mapControlLayersSwitchComponent)
      .subscribe((v) => {
        if (this.wmsLayerInfoPopup) {
          this.mapData?.map.removeLayer(this.wmsLayerInfoPopup);
          this.wmsLayerInfoPopup = null;
        }
        this.mapControlLayersSwitch = v;
      }),

    this.store.watchItem(storageNames.sidePanel).subscribe((v) => {
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
    if (
      this.activeVegIndexOption == null &&
      Array.isArray(this.vegIndexOptionsList)
    ) {
      this.activeVegIndexOption = this.vegIndexOptionsList[0];
    }

    if (this.activeVegIndexOption?.id) {
      this.getVegSatelliteDates(cid, this.activeVegIndexOption.id);
    }
    this.store.setItem<Feature>(
      storageNames.selectedLayerFeature,
      layerFeature.feature
    );
    const bounds = geoJSON(layerFeature.feature).getBounds();
    if (this.mapData?.map) {
      this.mapData.map.fitBounds(bounds, { maxZoom: 14 });
      this.mapService.invalidateSize(this.mapData.map);
    }
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.store.removeItem(storageNames.selectedLayerFeature);
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
    this.store.setItem(storageNames.sidePanel, { state: isOpened });
  }

  handleMapClick(e: LeafletMouseEvent) {
    if (this.mapComponent && this.activeContour != null) {
      this.mapComponent.handleFeatureClose();
    }
    // this.handleWmsLayerPopup(e);
  }

  async handleWmsLayerPopup(e: LeafletMouseEvent) {
    if (this.mapData?.map) {
      const sub = await buildWmsPopup({
        map: this.mapData.map,
        event: e,
        mapApi: this.api.map,
        mapControlLayersSwitch: this.mapControlLayersSwitch,
      });
      if (sub) this.wmsLayerInfoPopup = sub;
    }
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    if (this.polygonsRequestController) {
      this.polygonsRequestController.abort();
      this.polygonsRequestController = null;
    }
  }

  async handleMapMoveWithDebaunce(mapMove: MapMove): Promise<void> {
    this.store.setItem<Record<string, LatLngBounds | number>>(
      storageNames.arableLandComponent,
      {
        mapBounds: mapMove.bounds,
        mapZoom: mapMove.zoom,
      }
    );
    if (
      this.mapData?.map != null &&
      this.filterFormValues != null &&
      this.activeContour == null
    ) {
      const layersLength = this.mapData.geoJson.getLayers().length;
      if (layersLength > 0) this.mapData.geoJson.clearLayers();
      if (mapMove.zoom >= 12) this.addPolygonsInScreenToMap(mapMove.bounds);
      if (mapMove.zoom < 12) this.activeContourSmall = null;
    }
  }

  handleFilterFormReset(): void {
    this.wmsCQLFilter =
      'ltype in (1,2)&&year=' + this.mapService.filterDefaultValues.year;
    this.setWmsParams();
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
    this.filterFormValues = null;
    this.handleSetSidePanelState(false);
    this.mode = 'default';
  }

  handleSetSidePanelState(state: boolean) {
    this.store.setItem(storageNames.sidePanel, { state });
  }

  handleFilterFormSubmit(formValue: Record<string, any>) {
    this.filterFormValues = formValue['value'];

    if (this.mapData?.map) {
      this.mapData.geoJson.clearLayers();
      const data = this.store.getItem<Record<string, LatLngBounds | number>>(
        storageNames.arableLandComponent
      );

      const bounds = data?.['mapBounds'] as LatLngBounds;
      const zoom = data?.['mapZoom'] as number;

      if (bounds) {
        const layersLength = this.mapData.geoJson.getLayers().length;
        if (layersLength > 0) this.mapData.geoJson.clearLayers();
        if (zoom >= 12) this.addPolygonsInScreenToMap(bounds);
      }
    }

    this.store.setItem(storageNames.sidePanel, { state: false });
    this.toggleBtn.isContentToggled = false;
    this.handleSetSidePanelState(false);
    this.mode = 'contours_main';
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
        storageNames.arableLandComponent
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
      storageNames.arableLandComponent
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
    this.apiController.deleteContour({
      id,
      isWmsAiActive: this.isWmsAiActive,
      message: this.translate.transform('Polygon successfully deleted'),
    });
  }

  private async addPolygonsInScreenToMap(mapBounds: LatLngBounds) {
    this.loading = true;
    this.polygonsRequestController = new AbortController();
    await this.apiController.addPolygonsInScreenToMap({
      isWmsAiActive: this.isWmsAiActive,
      mapData: this.mapData,
      abortConroller: this.polygonsRequestController,
      filterFormValues: this.filterFormValues,
      landTypes: this.landTypes,
      mapBounds,
    });
    this.loading = false;
  }

  private async getContourData(id: number) {
    this.contourData = await this.apiController.getContourData({
      id,
      isWmsAiActive: this.isWmsAiActive,
      currLang: this.currentLang,
    });
  }

  private async getContour(id: number): Promise<void> {
    this.activeContour = await this.apiController.getContour({
      id,
      isWmsAiActive: this.isWmsAiActive,
    });
  }

  private async getLandTypes() {
    this.landTypes = await this.apiController.getLandTypes();
  }

  private async getRegionsPolygon() {
    await this.apiController.getRegionsPolygon({ mapData: this.mapData });
  }

  private async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    this.vegIndexesData = await this.apiController.getVegSatelliteDates({
      vegIndexId: vegIndexId,
      isWmsAiActive: this.isWmsAiActive,
      contoruId: contoruId,
    });
    this.loadingSatelliteDates = false;
  }

  private async getVegIndexList() {
    this.vegIndexOptionsList = await this.apiController.getVegIndexList();
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

  private handleWmsCQLFilter() {
    this.store
      .watchItem<ContourFiltersQuery | null>(
        storageNames.contourFilterComponent
      )
      .subscribe((v) => {
        if (v != null) {
          this.wmsCQLFilter = buildWmsCQLFilter(v);
          this.setWmsParams();
        }
      });
  }

  async ngOnInit(): Promise<void> {
    this.sidePanelService.watch((v) => {
      if (!!v && this.mapData?.map != null) {
        this.mapService.invalidateSize(this.mapData.map);
      }
    });
    const data = this.store.getItem(
      storageNames.mapControlLayersSwitchComponent
    );
    this.wmsSelectedStatusLayers = data;

    this.activeVegIndexOption = this.vegIndexOptionsList[0];

    await this.getLandTypes();
    await this.getVegIndexList();

    this.handleWmsCQLFilter();
  }

  ngAfterViewInit(): void {
    this.getRegionsPolygon();
    this.mapControls.handleBaseLayerChange('FULL_KR_TCI');

    const data = this.store.getItem(storageNames.arableLandComponent);
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
