import { LatLngBounds } from 'leaflet';

export interface IFeatureProperties {
  contour_id: number;
  contour_ink: number;
  conton_id: number;
  farmer_id: number;
  contour_year_id: number;
  productivity: number;
  land_type: number;
}

export interface IGetFeatureInfoQuery {
  service: string;
  request: string;
  version: string;
  srs: string;
  styles: string;
  format: string;
  bbox: string;
  layers: string;
  query_layers: string;
  transparent: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  exceptions?: string;
  info_format?: string;
  feature_count?: number;
}

export interface IPolygonsInScreenQuery {
  latLngBounds: LatLngBounds;
  land_type: string | number;
  year: string | number;
  culture: string | number;
}
