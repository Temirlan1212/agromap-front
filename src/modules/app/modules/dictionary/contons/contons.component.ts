import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/services/messages.service';
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
  pageSize: number = 20;
  totalCount: number = 0;

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
    this.getList(1);
  }

  async getList(page: number) {
    try {
      this.loading = true;
      const { results, count } = (await this.api.dictionary.getContons({
        page_size: this.pageSize,
        page: page,
        pagination: true,
      })) as IContonWithPagination;
      this.list = results;
      this.totalCount = count;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }
  }
}
