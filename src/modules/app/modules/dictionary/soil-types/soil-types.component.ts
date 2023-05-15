import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { SoilClass } from '../../../../api/models/soil.model';

type NameKey = 'name_ru' | 'name_ky' | 'name_en';

@Component({
  selector: 'app-soil-types',
  templateUrl: './soil-types.component.html',
  styleUrls: ['./soil-types.component.scss'],
})
export class SoilTypesComponent {
  loading: boolean = false;
  list: SoilClass[] = [];
  currentLang: string = this.translateSvc.currentLang;
  nameKey: NameKey = 'name_ru';

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService
  ) {
    this.translateSvc.onLangChange.subscribe((res) => {
      this.currentLang = res.lang;
      this.nameKey = `name_${this.currentLang}` as NameKey;
    });
  }

  ngOnInit() {
    this.getList();
  }

  async getList() {
    try {
      this.loading = true;
      this.list = await this.api.dictionary.getSoilClasses();
      console.log(this.list);
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }
  }
}
