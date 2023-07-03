import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateField',
  standalone: true,
  pure: true,
})
export class TranslateFieldPipe implements PipeTransform {
  transform(value: any, field: string): any {
    return value[field];
  }
}
