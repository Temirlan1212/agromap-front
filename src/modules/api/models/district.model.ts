import { Polygon } from 'geojson';

export interface IDistrict {
  id: number;
  created_at: string;
  updated_at: string;
  code_soato: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  region: number;
  polygon: Polygon;
}

export type IDistrictWithPagination = {
  count: number;
  next: null;
  previous: null;
  results: IDistrict[];
};

export interface IDistrictListQuery {
  polygon?: boolean;
  region_id?: number | boolean;
  ids?: string;
  page_size?: number;
  next?: null;
  previous?: null;
}
