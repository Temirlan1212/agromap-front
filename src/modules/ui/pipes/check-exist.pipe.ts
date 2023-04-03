import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'checkExist',
  standalone: true,
  pure: true,
})
export class CheckExistPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private translate: TranslatePipe
  ) {}

  transform(value: any): any {
    return value ? value : this.translate.transform('No data');
  }
}
