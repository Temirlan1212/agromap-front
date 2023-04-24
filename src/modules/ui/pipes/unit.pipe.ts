import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unit',
  standalone: true,
  pure: true,
})
export class UnitPipe implements PipeTransform {
  transform(value: unknown, label: string): string {
    if (!value) {
      return '';
    }

    return `${value} ${label}`;
  }
}
