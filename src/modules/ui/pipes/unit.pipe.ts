import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unit',
  standalone: true,
  pure: true,
})
export class UnitPipe implements PipeTransform {
  transform(value: unknown, label: string, type?: 'number'): string {
    if (!value) {
      return '';
    }

    if (type === 'number') {
      if (!isNaN(+value)) {
        return `${value.toLocaleString()} ${label}`;
      } else {
        return `${value}`;
      }
    }

    return `${value} ${label}`;
  }
}
