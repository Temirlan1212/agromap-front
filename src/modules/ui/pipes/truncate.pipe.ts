import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, length: number): string {
    if (value.length <= length) return value;
    return `${value.slice(0, length)}...`;
  }
}
