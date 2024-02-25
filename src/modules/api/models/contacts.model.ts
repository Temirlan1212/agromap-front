export interface IDepartment {
  id: string;
  name: string;
  name_ru: string;
  name_en: string;
  name_ky: string;
  unique_code: string;
}

export interface IContactInformation {
  id: number;
  title: string;
  fullname: string;
  address: string;
  phone: string;
  mail: string;
  point: IPoint;
  department: IDepartment;
  district: IDistrict;
  title_en: string;
  title_ky: string;
  title_ru: string;
  address_en: string;
  address_ky: string;
  address_ru: string;
}

export type TContactInfoTranslationFields =
  | 'title_en'
  | 'title_ru'
  | 'title_ky'
  | 'address_en'
  | 'address_ky'
  | 'address_ru';

export interface IPoint {
  type: string;
  coordinates: TLatLangCoordinates;
}

export type TLatLangCoordinates = [number, number];

export interface IDistrict {
  id: number;
  name: string;
  region: {
    id: number;
    name: string;
  };
}
