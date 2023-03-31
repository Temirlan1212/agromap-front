import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapData } from '../../../ui/models/map.model';
import {
  Layer,
  tileLayer,
  map,
  LatLng,
  LatLngBounds,
  Map,
  latLng,
  latLngBounds,
  MapOptions,
} from 'leaflet';
import { environment } from 'src/environments/environment';
import { imageOverlay } from 'leaflet';
import { ImageOverlay } from 'leaflet';

@Injectable()
export class MapService {
  map = new BehaviorSubject<MapData | null>(null);
  contourEditingMode = new Subject<boolean>();
  splitMapQuantity = new BehaviorSubject<number>(4);
  maps = new BehaviorSubject<Record<string, L.Map | null>>({});

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
            tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            }),
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
    const imageOverlayIncstance = imageOverlay(imageUrl, bounds, {
      ...Object.assign({ opacity: 1, interactive: true }, options),
    });
    map.addLayer(imageOverlayIncstance);
    return imageOverlayIncstance;
  }

  removeLayer(map: Map, layer: Layer): Map {
    return map.removeLayer(layer);
  }

  constructor() {}
}
