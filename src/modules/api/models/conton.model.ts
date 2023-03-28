import { GeoJSON } from 'geojson';

export interface IConton {
  id: number;
  created_at: string;
  updated_at: string;
  code_soato: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  district: number;
  region: number;
  polygon: GeoJSON.MultiPolygon;
}

export interface IContonListQuery {
  polygon?: boolean;
  district_id?: number;
  ids?: string;
}
