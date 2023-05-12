import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { StoreService } from '../../../../ui/services/store.service';
import { ITableAction } from 'src/modules/ui/models/table.model';
import { IUser } from 'src/modules/api/models/user.model';

@Component({
  selector: 'app-cultures',
  templateUrl: './cultures.component.html',
  styleUrls: ['./cultures.component.scss'],
})
export class CulturesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  list: any[] = [];
  user: IUser | null = this.api.user.getLoggedInUser();
  currentLang: string = this.translateSvc.currentLang;
  selectedId: number | null = null;
  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
    this.store.watch.subscribe((v) => {
      const createdCondition =
        v.name === 'CultureAddComponent' && v.value.created;
      const updatedCondition =
        v.name === 'CultureEditComponent' && v.value.updated;
      const deletedCondition =
        v.name === 'CulturesComponent' && v.value.deleted;
      if (createdCondition || updatedCondition || deletedCondition) {
        this.getList();
      }
    }),
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService
  ) {}

  ngOnInit() {
    this.getList();
  }

  async getList() {
    try {
      this.loading = true;
      this.list = await this.api.culture.getList();
    } catch (e: any) {
      console.log(e?.error?.message ? e?.error?.message : e?.message);
    } finally {
      this.loading = false;
    }
  }

  handleAddClick() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  async handleTableActionClick(action: ITableAction) {
    this.selectedId = action.item['id'] as number;
    if (action.type === 'delete') {
      await this.deleteItem();
      this.store.setItem('CulturesComponent', { deleted: true });
    }
    if (action.type === 'edit') {
      this.router.navigate([this.selectedId], { relativeTo: this.route });
    }
    this.selectedId = null;
  }

  async deleteItem(): Promise<void> {
    try {
      await this.api.culture.delete(this.selectedId as number);
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
