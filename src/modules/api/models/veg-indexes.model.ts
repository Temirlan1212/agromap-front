export interface IVegSatelliteDatesQuery {
  contourId: string;
  vegIndexId: string;
}

export interface IMeaningOfAverageValue {
  id: number;
  description_ru: string;
  description_ky: string | null;
  description_en: string | null;
  index: number;
}

export interface IVegSatelliteDateIndex {
  id: number;
  name_ru: string;
  name_ky: string | null;
  name_en: string | null;
  description_ru: string;
  description_ky: string | null;
  description_en: string | null;
}

export interface IVegSatelliteDate {
  id: number;
  meaning_of_average_value: IMeaningOfAverageValue;
  index: IVegSatelliteDateIndex;
  index_image: string;
  average_value: string;
  date: string;
  contour: number;
}

export interface IVegIndexOption extends Record<string, any> {
  id: number;
  name_ru: string;
  name_ky: string;
  name_en: string;
  description_ky?: string;
  description_ru?: string;
  description_en?: string;
}
