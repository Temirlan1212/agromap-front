import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pasture',
  templateUrl: './pasture.component.html',
  styleUrls: ['./pasture.component.scss'],
})
export class PastureComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  currentLang: string = this.translateSvc.currentLang;

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
  ];

  constructor(private translateSvc: TranslateService) {}

  async ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
