import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({name: 'formatDate', standalone: true })
export class FormatDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(value: string, exponent: string, locale: string): string {
    const month = new Date(value).getMonth();
    const year = new Date(value).getFullYear();

    const formattedMonth = this.translate.translations[locale]["Month-" + month];
    const formattedWeek = this.translate.translations[locale]["Week-" + new Date(value).getDay()];

    if(exponent === "fullDate") {
        return `${formattedWeek}, ${year} ${formattedMonth}, ${value.split("-")[2]}`
    }
    return value;
  }
}