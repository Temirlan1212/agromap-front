import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Routes } from '@angular/router';
import { Subscription } from 'rxjs';
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
  subscriptions: Subscription[] = [
    this.router.events.subscribe((e) => this.handleRouterEvent(e)),
    this.translate.onLangChange.subscribe((event: any) => {
      // console.log(event);
      console.log(this.router);
      // this.translate.get('page_title').subscribe((res: string) => {
      //   this.titleService.setTitle(res);
      // });
    })
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private titleService: Title
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
  }
}
