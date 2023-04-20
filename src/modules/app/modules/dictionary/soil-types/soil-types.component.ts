import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { SoilClass } from '../../../../api/models/soil.model';

@Component({
  selector: 'app-soil-types',
  templateUrl: './soil-types.component.html',
  styleUrls: ['./soil-types.component.scss'],
})
export class SoilTypesComponent {
  loading: boolean = false;
  list: SoilClass[] = [];
  currentLang: string = this.translateSvc.currentLang;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService
  ) {
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    );
  }

  ngOnInit() {
    this.getList();
  }

  async getList() {
    try {
      this.loading = true;
      this.list = await this.api.dictionary.getSoilClasses();
    } catch (e: any) {
      console.log(e.message);
    } finally {
      this.loading = false;
    }
  }
}
