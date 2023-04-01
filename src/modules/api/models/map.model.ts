import { Map } from 'leaflet';
import { Polygon } from 'geojson';

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

export interface IRegionPolygon {
  area: number;
  code_soato: string;
  created_at: string;
  density: number;
  id: number;
  name_en: string;
  name_ky: string;
  name_ru: string;
  polygon: Polygon;
  population: number;
  updated_at: string;
}
