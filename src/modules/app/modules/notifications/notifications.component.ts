import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../api/api.service';
import { StoreService } from '../../../ui/services/store.service';
import { ITableAction } from '../../../ui/models/table.model';
import { MessagesService } from '../../../ui/services/messages.service';
import { INotification } from '../../../api/models/notification.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [DatePipe],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  list: Record<string, any>[] = [];
  currentLang: string = this.translateSvc.currentLang;

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
  ];

  constructor(
    private translateSvc: TranslateService,
    private store: StoreService,
    private api: ApiService,
    private messages: MessagesService,
    private datePipe: DatePipe
  ) {}

  private renderNotifications = async () => {
    const res = await this.api.user.getNotifications();
    if (Array.isArray(res)) this.list = res;
    if (this.list.length > 0) this.formatNotifications();
  };

  async handleTableActionClick(action: ITableAction) {
    const item = action.item;
    if (action.type === 'delete' && item != null) {
      const res = await this.api.user.removeNotification(
        Number(action?.item['id']),
        { ...item, is_read: true } as any
      );
      if (res?.['message'] != null) {
        this.messages.success(res['message'][this.currentLang]);
      }
      this.renderNotifications();
    }
  }

  private formatNotifications() {
    const format = 'yyyy/MM/dd, h:mm a';
    this.list = (this.list as INotification[]).map((n) => {
      n.date = this.datePipe.transform(n.date, format) as string;
      n.status_ru = !!n?.is_read ? 'Прочитано' : 'Не прочитано';
      n.status_ky = !!n?.is_read ? 'Окулган' : 'Окулбаган';
      n.status_en = !!n?.is_read ? 'Read' : 'Unread';
      return n;
    });
  }

  async ngOnInit() {
    this.renderNotifications();

    this.list?.map((item) => {
      if (item?.['id']) {
        this.api.user.updateNotifications(item['id'], {
          ...item,
          is_read: true,
        } as any);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
