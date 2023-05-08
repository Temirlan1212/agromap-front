export interface ICulture {
  id: number;
  created_at: string;
  updated_at: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  coefficient_crop: number;
  fill_color: string;
  stroke_color: string;
}

export interface ICulture {
  id: number;
  created_at: string;
  updated_at: string;
  name_ru: string;
  name_ky: string;
  name_en: string;
  coefficient_crop: number;
  fill_color: string;
  stroke_color: string;
}

export interface ICultureIndicators {
  district_id: number;
  culture_id: number;
  max_elevation: string;
  min_elevation: string;
  ndvi_max: null;
  ndvi_min: null;
  vari_max: null;
  vari_min: null;
  ndwi_max: null;
  ndwi_min: null;
  ndre_max: null;
  ndre_min: null;
  savi_max: null;
  savi_min: null;
  district_name_en: string;
  district_name_ru: string;
  district_name_kg: string;
  year: string;
}
