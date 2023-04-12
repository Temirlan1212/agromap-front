import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { IContonWithPagination } from 'src/modules/api/models/conton.model';

@Component({
  selector: 'app-contons',
  templateUrl: './contons.component.html',
  styleUrls: ['./contons.component.scss'],
})
export class ContonsComponent {
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
      const { results } = (await this.api.dictionary.getContons({
        page_size: 100,
      })) as IContonWithPagination;
      this.list = results;
    } catch (e: any) {
      console.log(e.message);
    } finally {
      this.loading = false;
    }
  }
}
