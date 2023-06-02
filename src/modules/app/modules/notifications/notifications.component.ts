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
  list: any = [];
  currentLang: string = this.translateSvc.currentLang;

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
    this.store.watchItem('AppComponent').subscribe((res) => {
      this.list = res;
      if (this.list.length > 0) {
        this.formatNotificationListDate('yyyy/MM/dd, h:mm a');
      }
    }),
  ];

  constructor(
    private translateSvc: TranslateService,
    private store: StoreService,
    private api: ApiService,
    private messages: MessagesService,
    private datePipe: DatePipe
  ) {}

  async handleTableActionClick(action: ITableAction) {
    if (action.type === 'delete') {
      const res = await this.api.user.removeNotification(
        Number(action?.item['id'])
      );
      this.list = await this.api.user.getNotifications();
      this.messages.success(res['message'][this.currentLang]);
      this.store.setItem<INotification[] | null>('AppComponent', this.list);
    }
  }

  private formatNotificationListDate(format: string) {
    this.list = (this.list as INotification[]).map((n) => {
      n.date = this.datePipe.transform(n.date, format) as string;
      return n;
    });
  }

  ngOnInit() {
    this.list = this.store.getItem('AppComponent') ?? [];
    if (this.list.length > 0) {
      this.formatNotificationListDate('yyyy/MM/dd, h:mm a');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
