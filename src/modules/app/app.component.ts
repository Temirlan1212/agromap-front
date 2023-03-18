import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router, Routes } from '@angular/router';
import { delay, Subject, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { IUser } from '../api/models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'agro-front';
  currentUser: IUser | null = null;
  routes: Routes = this.router.config;
  currentPageTitle: string = this.titleService.getTitle();
  pageTitle$ = new Subject<void>();
  subscriptions: Subscription[] = [
    this.router.events.subscribe((e) => this.handleRouterEvent(e)),
    this.translate.onLangChange.pipe(switchMap(() => this.translate.get(this.currentPageTitle)))
      .subscribe(res => this.titleService.setTitle(res)),
    this.pageTitle$.pipe(switchMap(() => this.translate.get(this.currentPageTitle)), delay(1))
      .subscribe((tr: string) => this.titleService.setTitle(tr)),
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private translate: TranslateService,
    private titleService: Title,
  ) {
  }

  ngOnInit(): void {
    this.currentUser = this.api.user.getLoggedInUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  handleRouterEvent(event: unknown): void {
    if (event instanceof NavigationEnd) {
      this.currentUser = this.api.user.getLoggedInUser();
    }
    if (event instanceof ActivationEnd && event.snapshot.routeConfig?.title) {
      this.currentPageTitle = event.snapshot.routeConfig?.title as string;
      this.pageTitle$.next();
    }
  }
}
