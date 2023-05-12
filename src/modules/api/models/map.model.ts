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

export interface IPolygonsInScreenQuery {
  latLngBounds: LatLngBounds;
  land_type: string | number;
}
