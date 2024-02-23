import {
  geoJSON,
  latLngBounds,
  LatLngBounds,
  Map,
  LeafletMouseEvent,
  Popup,
  popup,
  geoJson,
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
import { MapData, MapMove } from 'src/modules/ui/models/map.model';
import { IChartData } from './components/spline-area-chart/spline-area-chart.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, Event, ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/modules/ui/services/store.service';
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
  initLayerProperties,
} from './lib/_constants';
import { buildWmsCQLFilter, buildWmsPopup } from './lib/_helpers';
import { ApiController } from './lib/controllers/api-controller';
import { CroplandMainMapService } from './lib/services/map.service';
import { PBFConroller } from './lib/controllers/pbf-controller';
import { CroplandMainLayerService } from './lib/services/layer.service';

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
  contourData: IChartData[] = [];
  productivity: string | null = null;
  wmsSelectedStatusLayers: Record<string, string> | null = null;
  activeContour!: any;
  activeContourBounds!: LatLngBounds;

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

  mapMoveSkipMount = true;

  constructor(
    private api: ApiService,
    private mapService: CroplandMainMapService,
    private store: StoreService,
    private translateSvc: TranslateService,
    private router: Router,
    private translate: TranslatePipe,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private apiController: ApiController,
    private pbfConroller: PBFConroller,
    private layerService: CroplandMainLayerService,
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
          // const data = this.store.getItem<
          //   Record<string, LatLngBounds | number>
          // >(storageNames.arableLandComponent);
          // const layersLength = this.mapData.geoJson.getLayers().length;
          // const zoom = data?.['mapZoom'] as number;
          // const bounds = data?.['mapBounds'] as LatLngBounds;
          // if (layersLength > 0) this.mapData.geoJson.clearLayers();
          // if (bounds && zoom >= 12) this.addPolygonsInScreenToMap(bounds);
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

    this.mapService.vectorGridStatus.subscribe((status) => {
      if (status === 'default' && this.activeContour) {
        this.handleFeatureClose();
        this.mapComponent.featureOpen = false;
        this.layerService.hoverProperites.next(initLayerProperties);
      }
    }),

    this.layerService.selectProperties.subscribe(async (v) => {
      if (!!v['id']) this.handleFeatureClick(v.id);
      if (!v['id']) {
        this.pbfConroller.setDefaultContour();
        this.activeContour = null;
        if (this.mapComponent) this.mapComponent.featureOpen = false;
      }
    }),
  ];

  async handleFeatureClick(id: number) {
    this.loading = true;
    await this.getContour(id);
    await this.getContourData(id);
    this.mapComponent.featureOpen = true;

    const bounds = geoJson(this.activeContour?.polygon).getBounds();
    if (bounds) this.pbfConroller.fitBounds(bounds);

    if (
      this.activeVegIndexOption == null &&
      Array.isArray(this.vegIndexOptionsList)
    ) {
      this.activeVegIndexOption = this.vegIndexOptionsList[0];
    }

    if (this.activeVegIndexOption?.id) {
      this.getVegSatelliteDates(id, this.activeVegIndexOption.id);
    }
    this.loading = false;
  }

  handleMapData(mapData: MapData): void {
    this.mapData = mapData;
    this.mapService.map.next(mapData);
  }

  handleFeatureClose(): void {
    this.layerService.selectProperties.next(initLayerProperties);
    this.pbfConroller.setUnselectZoom();
    this.activeVegIndexOption = this.vegIndexOptionsList[0];
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

  private mapSetView(mapMove: MapMove) {
    if (!this.mapMoveSkipMount) {
      this.pbfConroller.persistMapView(mapMove.zoom, mapMove.bounds);
    }
    this.mapMoveSkipMount = false;
  }

  async handleMapMoveWithDebaunce(mapMove: MapMove): Promise<void> {
    this.mapSetView(mapMove);
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

    this.store.setItem(storageNames.sidePanel, { state: false });
    this.toggleBtn.isContentToggled = false;
    this.handleSetSidePanelState(false);
    this.mode = 'contours_main';
  }

  handleVegIndexOptionClick(vegIndexOption: IVegIndexOption) {
    this.activeVegIndexOption = vegIndexOption;
    const contourId = this.layerService.selectProperties.getValue().id;

    if (this.activeVegIndexOption?.id && !!contourId) {
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
      if (this.mapComponent && this.activeContour != null) {
        this.mapComponent.handleFeatureClose();
      }
      if (this.mapComponent && this.activeContour != null) {
        this.mapComponent.handleFeatureClose();
      }
    }
  }

  handleEditClick() {
    const id = this.layerService.selectProperties.getValue().id;
    if (!!id) return;
    this.router.navigate(['contour-edit', id], { relativeTo: this.route });
    if (this.mapComponent) this.mapComponent.handleFeatureClose();
  }

  async handleDeleteSubmitted(dialog: QuestionDialogComponent): Promise<void> {
    await this.deleteItem();
    dialog.close();
  }

  async deleteItem(): Promise<void> {
    const id = this.layerService.selectProperties.getValue().id;
    if (!!id) return;

    this.apiController.deleteContour({
      id,
      isWmsAiActive: this.isWmsAiActive,
      message: this.translate.transform('Polygon successfully deleted'),
    });
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
    await this.apiController.addRegionsPolygonToMap();
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
    this.pbfConroller.initSchema();
  }

  ngAfterViewInit(): void {
    this.getRegionsPolygon();
    this.mapControls.handleBaseLayerChange('FULL_KR_TCI');
    const map = this.mapData?.map;
    if (map) this.pbfConroller.initPersistedMapView(map);

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
