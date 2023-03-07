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
  routes: Routes = this.router.config;
  subscriptions: Subscription[] = [
    this.router.events.subscribe((e) => this.handleRouterEvent(e)),
  ];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

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
