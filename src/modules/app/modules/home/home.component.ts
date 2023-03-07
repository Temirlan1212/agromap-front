import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  wms: L.TileLayer = L.tileLayer.wms(
    'https://geoserver.24mycrm.com/agromap/wms',
    {
      layers: 'agromap:agromap_store',
      format: 'image/png',
      transparent: true,
    }
  );
  mapInstance: L.Map | null = null;

  constructor() {}

  handleMapInstance(mapInstance: L.Map): void {
    mapInstance.addLayer(this.wms);
    this.mapInstance = mapInstance;
  }
}
