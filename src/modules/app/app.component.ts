import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router, Routes } from '@angular/router';
import { delay, Subject, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { IUser } from '../api/models/user.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../api/store.service';
import { ELanguage, ILanguage } from '../api/models/language.model';

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
    this.translate.onLangChange.subscribe((langObj) =>
      this.handleLangChange(langObj)
    ),
    this.pageTitle$
      .pipe(
        switchMap(() => this.translate.get(this.currentPageTitle)),
        delay(1)
      )
      .subscribe((tr: string) => this.titleService.setTitle(tr)),
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private translate: TranslateService,
    private titleService: Title,
    private store: StoreService
  ) {}

  private initLang(): void {
    const languageStore = this.store.getItem<ILanguage>('language');

    if (languageStore != null) {
      this.translate.addLangs(languageStore.all);
      this.translate.setDefaultLang(languageStore.default);
      this.translate.use(languageStore.current);
    } else {
      const languageConf: ILanguage = {
        default: ELanguage.ru,
        current: ELanguage.ru,
        all: [ELanguage.en, ELanguage.ru, ELanguage.ky],
      };
      this.store.setItem<ILanguage>('language', languageConf);
      this.translate.addLangs(languageConf.all);
      this.translate.setDefaultLang(languageConf.default);
      this.translate.use(languageConf.current);
    }
  }

  private updateStoreOnChangeLang(current: ELanguage): void {
    const languageStore = this.store.getItem<ILanguage>('language');
    languageStore.current = current;
    this.store.setItem<ILanguage>('language', languageStore);
  }

  ngOnInit(): void {
    this.initLang();
    this.currentUser = this.api.user.getLoggedInUser();
    this.routes = this.createRoutes(this.router.config);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  handleLangChange(langObj: LangChangeEvent): void {
    this.updateStoreOnChangeLang(langObj.lang as ELanguage);
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
