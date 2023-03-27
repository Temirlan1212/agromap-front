export enum ELanguage {
  en = 'en',
  ru = 'ru',
  ky = 'ky',
}

export interface ILanguage {
  current: ELanguage;
  default: ELanguage;
  all: ELanguage[];
}
