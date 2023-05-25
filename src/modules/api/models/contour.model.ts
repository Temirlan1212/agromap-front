import { Polygon } from 'geojson';
import { IDistrict } from './district.model';
import { IRegion } from './region.model';
import { ICulture } from './culture.model';
import { ILandType } from './land-type.model';
import { IConton } from './conton.model';
import { SoilClass } from './soil.model';

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
  soil_class: SoilClass;
  predicted_productivity: string;
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
