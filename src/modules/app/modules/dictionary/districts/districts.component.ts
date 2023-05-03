import { Component } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { IDistrictWithPagination } from 'src/modules/api/models/district.model';

@Component({
  selector: 'app-districts',
  templateUrl: './districts.component.html',
  styleUrls: ['./districts.component.scss'],
})
export class DistrictsComponent {
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

      const { results, count } = (await this.api.dictionary.getDistricts({
        page_size: this.pageSize,
        page,
      })) as IDistrictWithPagination;

      this.list = results;
      this.totalCount = count;
    } catch (e: any) {
      console.log(e.message);
    } finally {
      this.loading = false;
    }
  }
}
