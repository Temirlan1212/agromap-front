export interface IContourStatisticsProductivityQuery {
  region: string;
  district: string;
  culture: string;
  conton: string;
  year: number;
  land_type: string;
  ai: boolean;
}

export interface IProductive {
  ha: number;
  percent: number;
}

export interface IUnproductive {
  ha: number;
  percent: number;
}

export interface IContourStatisticsChildren {
  name: string;
  type: string;
  Productive: IProductive;
  Unproductive: IUnproductive;
}

export interface IContourStatisticsProductivity {
  name: string;
  type: string;
  Productive: IProductive;
  Unproductive: IUnproductive;
  Children?: IContourStatisticsChildren[];
}

export interface ICulutreStatisticsQuery {
  region: string;
  district: string;
  culture: string;
  conton: string;
  year: number;
  land_type: string;
}

export interface ICulutreStatistics {
  culture_name_ru: string;
  culture_name_ky: string;
  culture_name_en: string;
  area_ha: number;
  territory_ru: string;
  territory_ky: string;
  territory_en: string;
}
