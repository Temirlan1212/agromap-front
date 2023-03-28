import {
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
  map,
  tileLayer,
} from 'leaflet';
import { MapData, MapLayerFeature, MapMove } from '../../models/map.model';
import '@geoman-io/leaflet-geoman-free';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

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
  subscriptions: Subscription[] = [];
  @Output() mapData = new EventEmitter<MapData>();
  @Output() mapMove = new EventEmitter<MapMove>();
  @Output() featureClick = new EventEmitter<MapLayerFeature>();
  @Output() featureClose = new EventEmitter<void>();

  @HostBinding('class.open')
  featureOpen: boolean = false;

  map: Map | null = null;
  geoJson: GeoJSON = geoJSON(undefined, {
    onEachFeature: (feature: Feature, layer: Layer) => {
      layer.on({
        click: () => this.handleFeatureClick(layer, feature),
      });
    },
  });

  constructor(@Inject(LOCALE_ID) public locale: string, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = map('map', {
      attributionControl: false,
      center: this.center,
      maxBounds: this.maxBounds,
      maxZoom: 18,
      minZoom: 6,
      zoom: 6,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }),
      ],
      zoomControl: false,
    });

    this.map?.pm.setLang(this.translate.currentLang as any);
    this.translate.onLangChange.subscribe(res => {
      if (res.lang === 'ky') {
        this.map?.pm.setLang('ko', res.translations);
      } else {
        this.map?.pm.setLang(res.lang as any, res.translations);
      }
    });

    this.map.addLayer(this.geoJson);
    const s = fromEvent(this.map, 'moveend')
      .pipe(debounceTime(1000))
      .subscribe(() => this.handleMapMove());
    this.subscriptions.push(s);
    this.mapData.emit({ map: this.map, geoJson: this.geoJson });
  }

  handleMapMove(): void {
    if (this.map != null) {
      const zoom = this.map.getZoom();
      const bounds = this.map.getBounds();
      this.mapMove.emit({ zoom, bounds });
    }
  }

  handleFeatureClick(layer: Layer, feature: Feature): void {
    this.featureOpen = true;
    this.featureClick.emit({ layer, feature });
  }

  handleFeatureClose(): void {
    this.featureOpen = false;
    this.featureClose.emit();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
