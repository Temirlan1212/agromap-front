import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'yesNo',
  standalone: true,
  pure: true,
})
export class YesNoPipe implements PipeTransform {
  constructor(private translate: TranslatePipe) {}

  transform(value: any): string {
    return value
      ? this.translate.transform('Yes')
      : this.translate.transform('No');
  }
}
