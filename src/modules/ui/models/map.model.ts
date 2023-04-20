import { Feature } from 'geojson';
import { Map, GeoJSON, Layer, LatLngBounds, TileLayer } from 'leaflet';

export interface MapData {
  map: Map;
  geoJson: GeoJSON;
}

export interface MapLayerFeature {
  layer: Layer;
  feature: Feature;
}

export interface MapMove {
  zoom: number;
  bounds: LatLngBounds;
}

export interface ITileLayer {
  title: string;
  name: string;
  layer: TileLayer;
  type?: string;
}

export interface ILeafletMap extends Map {
  sync: (map: Map, options: Record<string, any>) => any;
}

export interface ISelectedItem {
  name: string;
  opacity: number;
  oldValue?: string;
}
