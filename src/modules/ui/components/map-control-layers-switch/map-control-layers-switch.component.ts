import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import * as L from 'leaflet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IBaseLyaerObject, IWmsLayersObject } from '../../models/map-controls';
import { Subscription } from 'rxjs';

const baseLayersArr = [
  {
    name: 'Google Hybrid',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    name: 'Google Satellite',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    name: 'Google Streets',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    name: 'Google Terrain',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    name: 'Open Street Map',
    layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    name: 'Stadia.OSMBright',
    layer: L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    ),
  },
];

@Component({
  selector: 'app-map-control-layers-switch',
  standalone: true,
  templateUrl: './map-control-layers-switch.component.html',
  styleUrls: ['./map-control-layers-switch.component.scss'],
  imports: [CommonModule, SvgIconComponent, TranslateModule],
})
export class MapControlLayersSwitchComponent implements OnDestroy {
  @Input() map!: L.Map;

  activeBaseLayer: L.TileLayer = baseLayersArr[0].layer;
  activeWmsLayer: L.TileLayer | null = null;
  currentLang = this.translate.currentLang;
  translateSubscription!: Subscription;

  baseLayersArr: IBaseLyaerObject[] = baseLayersArr;
  wmsLayersArr: IWmsLayersObject[] = [
    {
      name: this.translate.translations[this.currentLang]['SoilLayer'],
      layers: 'agromap:soil_agromap',
      active: false,
    },
  ];

  isCollapsed = false;

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService
  ) {
    this.translateSubscription = translate.onLangChange.subscribe(() => {
      this.currentLang = translate.currentLang;
    });
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickInside = this.elementRef.nativeElement.contains(target);
    if (!clickInside) this.isCollapsed = false;
  }

  handleCollapseClick(e: Event) {
    this.isCollapsed = !this.isCollapsed;
  }

  handleSelectBaseLayerClick(selectedLayer: IBaseLyaerObject) {
    if (this.activeBaseLayer === selectedLayer.layer) return;

    this.baseLayersArr.map((layer) => {
      this.map.removeLayer(layer.layer);
    });

    this.map.addLayer(selectedLayer.layer);
    this.activeBaseLayer = selectedLayer.layer;
  }

  handleSelectWmsLayerClick(selectedLayer: IWmsLayersObject) {
    if (selectedLayer.active && this.activeWmsLayer) {
      this.map.removeLayer(this.activeWmsLayer);
      selectedLayer.active = !selectedLayer.active;
      return;
    }

    this.wmsLayersArr.map((layer) => {
      layer.active = false;
      this.activeWmsLayer && this.map.removeLayer(this.activeWmsLayer);
    });

    this.activeWmsLayer = L.tileLayer.wms(
      'https://geoserver.24mycrm.com/agromap/wms?',
      {
        layers: selectedLayer.layers,
        format: 'image/png',
        zIndex: 1,
        transparent: true,
      }
    );

    this.map.addLayer(this.activeWmsLayer);
    selectedLayer.active = !selectedLayer.active;
  }

  ngOnDestroy(): void {
    this.translateSubscription.unsubscribe();
  }
}
