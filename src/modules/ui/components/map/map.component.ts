import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { Feature } from 'geojson';
import {
  Map,
  GeoJSON,
  geoJSON,
  Layer,
  LatLng,
  LatLngBounds,
  latLng,
  latLngBounds,
  tileLayer,
  Browser,
  DomEvent,
  Polygon,
  LeafletMouseEvent,
  LeafletEvent,
} from 'leaflet';
import { MapData, MapLayerFeature, MapMove } from '../../models/map.model';
import '@geoman-io/leaflet-geoman-free';
import {
  debounce,
  debounceTime,
  fromEvent,
  interval,
  Subscription,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from 'src/modules/ui/services/map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  host: { class: 'map' },
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() center: LatLng = latLng(41.84, 75.06);
  @Input() maxBounds: LatLngBounds = latLngBounds(
    latLng(44.0, 68.0),
    latLng(39.0, 81.0)
  );
  @Input() featureTitle: string = '';
  @Input() mapId: string = 'map';
  subscriptions: Subscription[] = [];
  @Output() mapData = new EventEmitter<MapData>();
  @Output() mapMove = new EventEmitter<MapMove>();
  @Output() mapClick = new EventEmitter<LeafletMouseEvent>();
  @Output() mapMousemove = new EventEmitter<LeafletMouseEvent>();
  @Output() featureClick = new EventEmitter<MapLayerFeature>();
  @Output() featureClose = new EventEmitter<void>();
  @Output() featureHover = new EventEmitter<MapLayerFeature>();
  @Output() featureUnhover = new EventEmitter<MapLayerFeature>();
  @HostBinding('class.open')
  featureOpen: boolean = false;

  @HostBinding('class.collapsed')
  feautureCollapse: boolean = false;

  map: Map | null = null;
  geoJson: GeoJSON = geoJSON(undefined, {
    onEachFeature: (feature: Feature, layer: Layer) => {
      layer.on({
        click: (e) => {
          DomEvent.stopPropagation(e);
          this.handleFeatureClick(layer, feature);
        },
        ...(!Browser.mobile && {
          mouseover: () => this.handleFeatureHover(layer, feature),
        }),
        mouseout: () => this.featureUnhover.emit({ layer, feature }),
      });
    },
  });

  geoJsonStatic: GeoJSON = geoJSON(undefined);

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private translate: TranslateService,
    private mapService: MapService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cd.detectChanges();
    this.initMap();
    if (this.map != null) this.mapService.invalidateSize(this.map);
  }

  initMap(): void {
    this.map = this.mapService.initMap(this.mapId, {
      maxBounds: this.maxBounds,
      center: this.center,
    });

    this.map?.pm.setLang(this.translate.currentLang as any);
    this.translate.onLangChange.subscribe((res) => {
      if (res.lang === 'ky') {
        this.map?.pm.setLang('ko', res.translations);
      } else {
        this.map?.pm.setLang(res.lang as any, res.translations);
      }
    });

    this.map.addLayer(this.geoJson);
    this.map.addLayer(this.geoJsonStatic);
    this.handleMapEventSubscription();
    this.handleMapClick();
    this.mapData.emit({
      map: this.map,
      geoJson: this.geoJson,
      geoJsonStatic: this.geoJsonStatic,
    });
  }

  handleMapEventSubscription() {
    const s = fromEvent(this.map as Map, 'moveend')
      .pipe(
        debounce((i) => {
          return interval(1000);
        })
      )
      .subscribe(() => this.handleMapMove());
    this.subscriptions.push(s);

    this.subscriptions.push(
      fromEvent<LeafletMouseEvent>(this.map as Map, 'mousemove')
        .pipe(debounceTime(100))
        .subscribe((e) => this.handleMapMousemove(e))
    );
  }

  removeSubscriptions() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  handleMapMove(): void {
    if (this.map != null) {
      const zoom = this.map.getZoom();
      const bounds = this.map.getBounds();
      this.mapMove.emit({ zoom, bounds });
    }
  }

  handleMapClick(): void {
    (this.map as Map).on('click', (e: LeafletMouseEvent) => {
      this.mapClick.emit(e);
    });
  }

  handleMapMousemove(e: LeafletMouseEvent): void {
    this.mapMousemove.emit(e as LeafletMouseEvent);
  }

  handleFeatureClick(layer: Layer, feature: Feature): void {
    this.featureOpen = true;
    this.featureClick.emit({ layer, feature });
  }

  handleFeatureHover(layer: Layer, feature: Feature) {
    this.featureHover.emit({ layer, feature });
  }

  handleFeatureClose(): void {
    this.featureOpen = false;
    this.featureClose.emit();
  }

  handleFeatureCollapseToggle() {
    this.feautureCollapse = !this.feautureCollapse;
    if (this.map) this.mapService.invalidateSize(this.map);
  }

  ngOnDestroy() {
    this.removeSubscriptions();
  }
}
