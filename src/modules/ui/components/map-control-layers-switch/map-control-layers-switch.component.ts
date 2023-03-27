import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import * as L from 'leaflet';

const baseLayersArr = [
  {
    name: 'Google Hybrid',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
    isBaseLayer: true,
  },
  {
    name: 'Google Satellite',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
    isBaseLayer: true,
  },
  {
    name: 'Google Streets',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
    isBaseLayer: true,
  },
  {
    name: 'Google Terrain',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
    isBaseLayer: true,
  },
  {
    name: 'Open Street Map',
    layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 2,
    }),
    isBaseLayer: true,
  },
  {
    name: 'Stadia.OSMBright',
    layer: L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    ),
    isBaseLayer: true,
  },
];

const wmsLayersArr = [
  {
    name: 'Слой почвы',
    layers: 'agromap:soil_agromap',
    active: false,
  },
];

interface IBaseLyaerObject {
  name: string;
  layer: L.TileLayer;
}

interface IWmsLayersObject {
  name: string;
  layers: string;
  active: boolean;
}

@Component({
  selector: 'app-map-control-layers-switch',
  standalone: true,
  templateUrl: './map-control-layers-switch.component.html',
  styleUrls: ['./map-control-layers-switch.component.scss'],
  imports: [CommonModule, SvgIconComponent],
})
export class MapControlLayersSwitchComponent implements OnInit {
  @Input() map!: L.Map;

  activeBaseLayer: L.TileLayer = baseLayersArr[0].layer;
  activeWmsLayer: L.TileLayer | null = null;

  baseLayersArr: IBaseLyaerObject[] = baseLayersArr;
  wmsLayersArr: IWmsLayersObject[] = wmsLayersArr;

  isCollapsed = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

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
}
