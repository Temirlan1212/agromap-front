import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router, Routes } from '@angular/router';
import { delay, Subject, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { IUser } from '../api/models/user.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../ui/services/store.service';
import { ELanguageCode, ILanguageStore } from '../ui/models/language.model';
import { LanguageService } from '../ui/services/language.service';
import { INotification } from '../api/models/notification.model';
import { MessagesService } from '../ui/components/services/messages.service';

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
  notifications: INotification[] = [];
  subscriptions: Subscription[] = [
    this.router.events.subscribe((e) => this.handleRouterEvent(e)),
    this.translate.onLangChange.subscribe((langObj) =>
      this.handleLangChange(langObj)
    ),
    this.pageTitle$
      .pipe(
        switchMap(() => this.translate.get(this.currentPageTitle)),
        delay(1)
      )
      .subscribe((tr: string) => this.titleService.setTitle(tr)),
    this.api.user.notifications.subscribe((res) => {
      this.notifications = res;
      this.store.setItem<INotification[] | null>(
        'AppComponent',
        this.notifications
      );
    }),
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private translate: TranslateService,
    private titleService: Title,
    private store: StoreService,
    private language: LanguageService,
    private messages: MessagesService
  ) {}

  private initLang(): void {
    const languageStore = this.store.getItem<ILanguageStore>('language');

    if (languageStore != null) {
      this.translate.addLangs(languageStore.all.map((f) => f.code));
      this.translate.setDefaultLang(languageStore.default);
      this.translate.use(languageStore.current);
    } else {
      const initialLanguageStore = this.language.getInitialLanguageStore();
      this.store.setItem<ILanguageStore>('language', initialLanguageStore);
      this.translate.addLangs(initialLanguageStore.all.map((f) => f.code));
      this.translate.setDefaultLang(initialLanguageStore.default);
      this.translate.use(initialLanguageStore.current);
    }
  }

  private updateStoreOnChangeLang(current: ELanguageCode): void {
    const languageStore = this.store.getItem<ILanguageStore>('language');
    if (languageStore != null) {
      languageStore.current = current;
      this.store.setItem<ILanguageStore>('language', languageStore);
    }
  }

  ngOnInit(): void {
    this.initLang();
    this.currentUser = this.api.user.getLoggedInUser();
    this.routes = this.createRoutes(this.router.config);
    this.getNotifications();
  }

  async getNotifications() {
    try {
      this.notifications = await this.api.user.getNotifications();
      this.store.setItem<INotification[] | null>(
        'AppComponent',
        this.notifications
      );
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  handleLangChange(langObj: LangChangeEvent): void {
    this.updateStoreOnChangeLang(langObj.lang as ELanguageCode);
    const trTitle = langObj.translations[this.currentPageTitle];
    if (trTitle != null) {
      this.titleService.setTitle(trTitle);
    }
  }

  handleRouterEvent(event: unknown): void {
    if (event instanceof NavigationEnd) {
      this.currentUser = this.api.user.getLoggedInUser();
      this.routes = this.createRoutes(this.router.config);
    }
    if (event instanceof ActivationEnd && event.snapshot.routeConfig?.title) {
      this.currentPageTitle = event.snapshot.routeConfig?.title as string;
      this.pageTitle$.next();
    }
  }

  createRoutes(routes: Routes): Routes {
    const result: Routes = [];

    for (const route of routes) {
      if (route.data != null && route.data['authenticated'] === true) {
        if (this.currentUser != null) {
          result.push(route);
        }
      } else {
        result.push(route);
      }
    }

    return result;
  }
}
