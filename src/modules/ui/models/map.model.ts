import { Feature } from 'geojson';
import { Map, GeoJSON, Layer, LatLngBounds } from 'leaflet';

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
