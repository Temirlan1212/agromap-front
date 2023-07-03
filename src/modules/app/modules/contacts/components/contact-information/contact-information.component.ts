import { Component, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  IContactInformation,
  TContactInfoTranslationFields,
} from 'src/modules/api/models/contacts.model';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss'],
})
export class ContactInformationComponent implements OnDestroy {
  @Input() contactInformation: IContactInformation | null = null;
  currLang: string = this.translateSrvc.currentLang;
  subs: Subscription[] = [];

  constructor(private translateSrvc: TranslateService) {
    const sub = this.translateSrvc.onLangChange.subscribe(
      (lang: Record<string, any>) => (this.currLang = lang['lang'] as string)
    ) as Subscription;
    this.subs = [...this.subs, sub];
  }

  getField(key: string): string | undefined {
    return (this.contactInformation as any)[key];
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
