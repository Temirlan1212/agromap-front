import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapData } from '../../../ui/models/map.model';
import { tileLayer, map, LatLng, LatLngBounds, Map, latLng, latLngBounds } from 'leaflet';
type TInitMap = (mapId: string, options: {center: LatLng}) => Map;
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

  initMap = (mapId: string, options?: { center?: LatLng, maxBounds?: LatLngBounds, maxZoom?: number, minZoom?: number, zoom?: number}) => {
    return map(mapId, {
      attributionControl: false,
      center: options?.center ?? this.center,
      maxBounds: options?.maxBounds,
      maxZoom: options?.maxZoom ?? 18,
      minZoom: options?.zoom ?? 6,
      zoom: options?.minZoom ?? 6,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }),
      ],
      zoomControl: false,
    });
  }

  constructor() {
  }
}
