import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, Routes } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../api/api.service';
import { IUser } from '../api/models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'agro-front';
  currentUser: IUser | null = null;
  routes: Routes = [];
  subscriptions: Subscription[] = [
    this.router.events.subscribe((e) => this.handleRouterEvent(e)),
  ];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.api.user.getLoggedInUser();
    this.routes = this.createRoutes(this.router.config);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  handleRouterEvent(event: unknown): void {
    if (event instanceof NavigationEnd) {
      this.currentUser = this.api.user.getLoggedInUser();
      this.routes = this.createRoutes(this.router.config);
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
