import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

export type ActiveLayerAttributesType = {
  label: any;
  value: () => string | null;
};

@Injectable({ providedIn: 'root' })
export class ActiveLayerAttributes {
  currentLang: string = this.translateSvc.currentLang;
  sub: Subscription = this.translateSvc.onLangChange.subscribe((res) => {
    this.currentLang = res.lang;
  });
  constructor(private translateSvc: TranslateService) {}

  attributes = (object: Record<string, any>): ActiveLayerAttributesType[] => {
    const translations = this.translateSvc.translations[this.currentLang];
    return [
      {
        label: translations['Contour id'],
        value: () => {
          const value = object['id'];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: translations['Area'],
        value: () => {
          const value = object['area_ha'];
          if (!value) return null;
          return `${value} ${translations['ha']}`;
        },
      },
      {
        label: translations['Region'],
        value: () => {
          const value = object['region'][`name_${this.currentLang}`];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: translations['District'],
        value: () => {
          const value = object['district'][`name_${this.currentLang}`];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: translations['Conton'],

        value: () => {
          const value = object['conton'][`name_${this.currentLang}`];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: translations['Land type'],
        value: () => {
          const value = object['type'][`name_${this.currentLang}`];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: translations['Productivity'],
        value: () => {
          const value = object['productivity'];
          if (!value) return null;
          return `${value} ${translations['c. per ha.']}`;
        },
      },
      {
        label: `${translations['Productivity']} ${translations['RSE']}`,
        value: () => {
          const value = object['predicted_productivity'];
          if (!value) return null;
          return `${value} ${translations['c. per ha.']}`;
        },
      },
      {
        label: translations['Elevation'],
        value: () => {
          const value = object['elevation'];
          if (!value) return null;
          return `${value} ${translations['m. above sea level']}`;
        },
      },
      {
        label: translations['RSE determination error'],
        value: () => {
          const value = object['percent'];
          if (!value) return null;
          return `${Number(value) * 100}%`;
        },
      },
      {
        label: translations['Soil class'],
        value: () => {
          const value = object['soil_class'][`name_${this.currentLang}`];
          return `ID ${object['soil_class']['id']} - ${value}`;
        },
      },
      {
        label: translations['INK'],
        value: () => {
          const value = object['ink'];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: `ENI-${translations['Code'].toLowerCase()}`,
        value: () => {
          const value = object['eni'];
          if (!value) return null;
          return `${value}`;
        },
      },
      {
        label: `${translations['Culture']}`,
        value: () => {
          const value = object['culture'][`name_${this.currentLang}`];
          return value ? value : translations['Culture is not defined'];
        },
      },
      {
        label: `${translations['Culture']} ${translations['RSE']}`,
        value: () => {
          const value = object['predicted_culture'][`name_${this.currentLang}`];
          return value ? value : translations['Culture is not defined'];
        },
      },
    ];
  };
}
