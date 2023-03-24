export interface ActualVegIndexes {
  id: number;
  meaning_of_average_value: MeaningOfAverageValue;
  index: Index;
  index_image: string;
  average_value: number;
  date: string;
  contour: number;
}

export interface MeaningOfAverageValue {
  id: number;
  description_ru: string;
  description_ky: string;
  description_en: string;
  index: number;
}

export interface Index {
  id: number;
  name_ru: string;
  name_ky: string;
  name_en: string;
  description_ru: string;
  description_ky: string;
  description_en: string;
}
