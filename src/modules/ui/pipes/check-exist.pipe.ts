import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkExist',
  standalone: true,
  pure: true,
})
export class CheckExistPipe implements PipeTransform {

  transform(value: any): any {
    return value != null ? value : 'No data';
  }
}
