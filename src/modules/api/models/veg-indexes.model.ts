export interface IVegSatelliteDatesQuery {
  contourId: string;
  vegIndexId: string;
}

export interface IVegSatelliteDate {
  id: number;
  meaning_of_average_value: {
    id: number;
    description_ru: string;
    description_ky: string | null;
    description_en: string | null;
    index: number;
  };
  index: {
    id: number;
    name_ru: string;
    name_ky: string | null;
    name_en: string | null;
    description_ru: string;
    description_ky: string | null;
    description_en: string | null;
  };
  index_image: string;
  average_value: string;
  date: string;
  contour: number;
}

export interface IVegIndexList {
  id: number;
  name_ru: string;
  name_ky: string;
  name_en: string;
  description_ky: string;
  description_ru: string;
  description_en: string;
}

export interface IDate {
  formattedDate: string;
  date: string;
}
