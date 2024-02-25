import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapData } from '../models/map.model';
import {
  tileLayer,
  map,
  LatLng,
  LatLngBounds,
  Map,
  latLng,
  latLngBounds,
  MapOptions,
} from 'leaflet';
import { imageOverlay } from 'leaflet';
import { ImageOverlay } from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {
  map = new BehaviorSubject<MapData | null>(null);
  contourEditingMode = new Subject<boolean>();
  splitMapQuantity = new BehaviorSubject<number>(2);
  maps = new BehaviorSubject<Record<string, L.Map | null>>({});
  loading = new BehaviorSubject<boolean>(false);
  filterDefaultValues = {
    year: 2022,
  };

  center: LatLng = latLng(41.84, 75.06);
  maxBounds: LatLngBounds = latLngBounds(
    latLng(44.0, 68.0),
    latLng(39.0, 81.0)
  );
  initMap = (mapId: string, options?: MapOptions): Map => {
    return map(mapId, {
      ...Object.assign(
        {
          center: this.center,
          maxBounds: this.maxBounds,
          maxZoom: 18,
          minZoom: 6,
          zoom: 6,
          attributionControl: false,
          zoomControl: false,
          layers: [
            tileLayer(
              'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
              {
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              }
            ),
          ],
        },
        options
      ),
    });
  };

  setImageOverlay(
    map: Map,
    imageUrl: string,
    bounds: L.LatLngBounds,
    options?: L.ImageOverlayOptions
  ): ImageOverlay {
    map.createPane('image-overlay-pane').style.zIndex = '402';

    const imageOverlayIncstance = imageOverlay(imageUrl, bounds, {
      ...Object.assign({ opacity: 1, interactive: true }, options),
      pane: 'image-overlay-pane',
    });
    map.addLayer(imageOverlayIncstance);
    return imageOverlayIncstance;
  }

  invalidateSize(map: Map, delay: number = 300) {
    setTimeout(() => {
      map.invalidateSize();
    }, delay);
  }

  constructor() {}
}
