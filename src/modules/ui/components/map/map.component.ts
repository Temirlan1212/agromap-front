import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  host: { class: 'map' },
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  @Input() center: L.LatLng = L.latLng(41.84, 75.06);
  @Input() maxBounds: L.LatLngBounds = L.latLngBounds(
    L.latLng(44.0, 68.0),
    L.latLng(39.0, 81.0)
  );

  @Output() mapInstance = new EventEmitter<L.Map>();

  map: L.Map | null = null;

  constructor() {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map', {
      center: this.center,
      maxBounds: this.maxBounds,
      maxZoom: 16,
      minZoom: 6,
      zoom: 6,
      layers: [
        L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }),
      ],
    });

    this.mapInstance.emit(this.map);
  }
}
