import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { latLng, LatLng, map, Map, tileLayer } from 'leaflet';
import 'leaflet.sync';
import { SplitMapService } from '../services/split-map.services';
import { Subscription } from "rxjs"

@Component({
  selector: 'app-split-map',
  templateUrl: './split-map.component.html',
  styleUrls: ['./split-map.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class SplitMapComponent implements OnDestroy, OnInit {
  @ViewChild('splitMap') splitMapEl!: ElementRef<HTMLElement>;
  currentRouterPathname: string = '';
  mapsQuantity!: number;
  maps: Record<string, Map | null> = {};
  splitMapQuantitySubscription!: Subscription;

  @Input() center: LatLng = latLng(41.84, 75.06);

  constructor(public splitMapService: SplitMapService) {}

  initMap(id: string) {
    this.maps[id] = map(id, {
      attributionControl: false,
      center: this.center,
      maxZoom: 16,
      minZoom: 10,
      zoom: 13,
      zoomControl: false,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }),
      ],
    });
  }

  removeMaps() {
    for (const [key, map] of Object.entries(this.maps)) {
      if (map) this.maps[key]?.remove();
      this.maps[key] = null;
    }
  }

  initMaps() {
    for (const [key, map] of Object.entries(this.maps)) {
      var container = L.DomUtil.get(key);
      if (container != null) {
        this.initMap(key);
      }
    }
  }

  syncMap() {
    for (const [key1, map1] of Object.entries(this.maps)) {
      for (const [key2, map2] of Object.entries(this.maps)) {
        if (key1 !== key2 && map1 && map2) {
          (map1 as any).sync(map2, {
            syncCursor: true,
            syncCursorMarkerOptions: {
              radius: 5,
              fillOpacity: 1,
              color: 'white',
              fillColor: 'white',
            },
          });
        }
      }
    }
  }

  ngOnInit(): void {
    this.splitMapQuantitySubscription = this.splitMapService.splitMapQuantity.subscribe((val) => {
      this.mapsQuantity = val;

      setTimeout(() => {
        this.removeMaps();
        this.initMaps();
        this.syncMap();
        this.splitMapService.maps.next(this.maps);
      }, 0);
    });

    for (let i = 0; i < 4; i++) {
      this.maps[`map-${i}`] = null;
    }
  }
  
  ngOnDestroy(): void {
    this.splitMapQuantitySubscription.unsubscribe()
  }
}
