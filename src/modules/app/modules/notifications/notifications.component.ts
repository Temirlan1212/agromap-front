import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnDestroy {
  loading: boolean = false;
  list: any[] = [
    {
      id: 1,
      recipient: 1,
      actor_object_id: '1',
      verb: 'You have received a payment',
    },
    {
      id: 2,
      recipient: 2,
      actor_object_id: '2',
      verb: 'You have received a payment',
    },
    {
      id: 3,
      recipient: 3,
      actor_object_id: '3',
      verb: 'You have received a payment',
    },
    {
      id: 4,
      recipient: 4,
      actor_object_id: '4',
      verb: 'You have received a payment',
    },
    {
      id: 5,
      recipient: 5,
      actor_object_id: '5',
      verb: 'You have received a payment',
    },
    {
      id: 6,
      recipient: 6,
      actor_object_id: '6',
      verb: 'You have received a payment',
    },
  ];
  currentLang: string = this.translateSvc.currentLang;

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
  ];

  constructor(private translateSvc: TranslateService) {}

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
