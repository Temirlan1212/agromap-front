import { GeoJSON } from 'geojson';

export interface IDistrict {
  id: number;
  created_at: string;
  updated_at: string;
  code_soato: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  region: number;
  polygon: GeoJSON.Polygon;
}

export interface IDistrictListQuery {
  polygon?: boolean;
  region_id?: number | boolean;
}
