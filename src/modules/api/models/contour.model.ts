import { Polygon } from 'geojson';
import { IConton } from './conton.model';
import { ILandType } from './land-type.model';
import { ICulture } from './culture.model';
import { IRegion } from './region.model';
import { IDistrict } from './district.model';

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
  conton: IConton;
  type: ILandType;
  culture: ICulture;
  farmer: number;
  region: IRegion;
  district: IDistrict;
}

export interface ContourFiltersQuery {
  year?: number;
  land_type?: number | string;
  region: number;
  district: number;
  conton: number;
  culture?: number | string;
  ai?: boolean;
}
