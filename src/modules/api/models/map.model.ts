import { Map } from 'leaflet';

export interface IFeatureProperties {
  contour_id: number;
  contour_ink: number;
  conton_id: number;
  farmer_id: number;
  contour_year_id: number;
  productivity: number;
  land_type: number;
}

export interface ILeafletMap extends Map {
  sync: (map: Map, options: Record<string, any>) => any;
}
