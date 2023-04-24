import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/services/messages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-indexes',
  templateUrl: './indexes.component.html',
  styleUrls: ['./indexes.component.scss'],
})
export class IndexesComponent {
  loading: boolean = false;
  list: any[] = [];
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
      this.list = await this.api.dictionary.getIndexes();
    } catch (e: any) {
      console.log(e.message);
    } finally {
      this.loading = false;
    }
  }
}
