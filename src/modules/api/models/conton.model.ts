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

export interface IContonWithPagination {
  count: number;
  next: number;
  previous: number;
  results: IConton[];
}

export interface IContonListQuery {
  polygon?: boolean;
  district_id?: number;
  id?: string;
  page_size?: number;
  next?: number;
  previous?: number;
  page?: number;
  pagination?: boolean;
}
