export enum ELanguageCode {
  en = 'en',
  ru = 'ru',
  ky = 'ky',
}

export interface ILanguage {
  code: ELanguageCode;
  name: string;
}

export interface ILanguageStore {
  current: ELanguageCode;
  default: ELanguageCode;
  all: ILanguage[];
}
