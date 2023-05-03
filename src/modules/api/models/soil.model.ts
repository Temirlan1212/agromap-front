export interface SoilClass {
  id: number;
  ID: number;
  name_ru: string;
  name_ky: string;
  name_en: string;
  description: string;
  description_ru: string;
  description_ky: string;
  description_en: string;
  color: string;
  [key: string]: string | number;
}
