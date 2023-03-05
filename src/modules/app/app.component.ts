import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IRoutes } from '../ui/models/routes.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'agro-front';
  topRoutes: IRoutes[] = [
    { path: 'analytics', title: 'Analytics', iconSrc: '' },
  ];

  constructor(private router: Router) {}
}
