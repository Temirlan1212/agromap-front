import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateField',
  standalone: true,
  pure: true,
})
export class TranslateFieldPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: Record<string, any>, field: string): string {
    return value[`${field}_${this.translate.currentLang}`];
  }
}
