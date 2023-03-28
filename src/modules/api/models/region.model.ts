import { Polygon } from 'geojson';

export interface IRegion {
  id: number;
  created_at: string;
  updated_at: string;
  code_soato: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  population: number;
  area: number;
  density: number;
  polygon: Polygon;
}

export interface IRegionListQuery {
  polygon: boolean;
}
