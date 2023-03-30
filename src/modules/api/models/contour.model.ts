import { Polygon } from 'geojson';

export interface IContour {
  id: number;
  year: number;
  code_soato: string;
  ink: string;
  created_at: string;
  updated_at: string;
  polygon: Polygon;
  productivity: string;
  area_ha: number;
  is_deleted: boolean;
  elevation: string;
  is_rounded: boolean;
  conton: number;
  type: number;
  culture: number;
  farmer: number;
}

export interface ContourFiltersQuery {
  year?: number;
  land_type?: number;
  region: number;
  district: number;
  conton: number;
}
