import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { NotFoundPageComponent } from '../ui/components/not-found-page/not-found-page.component';
import { IsAuthenticatedGuard } from './is-authenticated.guard';

const routes: Routes = [
  {
    title: 'App',
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    title: 'Login',
    path: 'login',
    canActivate: [IsAuthenticatedGuard],
    loadChildren: () =>
      import('src/modules/app/modules/login/login.module').then(
        (m) => m.LoginModule
      ),
  },
  {
    title: 'GiproZem',
    path: 'home',
    data: { position: 'top', image: 'logo.png', class: 'homepage' },
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    title: 'Home',
    path: 'home',
    data: { icon: 'home', class: 'homepage-mobile' },
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    title: 'Reports',
    path: 'reports',
    data: { position: 'top', icon: 'reports' },
    loadChildren: () =>
      import('./modules/reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    title: 'Dictionary',
    path: 'dictionary',
    data: { position: 'top', icon: 'dictionary' },
    loadChildren: () =>
      import('./modules/dictionary/dictionary.module').then(
        (m) => m.DictionaryModule
      ),
  },
  {
    title: 'About system',
    path: 'about',
    data: { position: 'top', icon: 'info' },
    loadChildren: () =>
      import('./modules/about/about.module').then((m) => m.AboutModule),
  },
  {
    title: 'Profile',
    path: 'profile',
    data: { position: 'bottom', icon: 'user' },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    title: 'Notifications',
    path: 'notifications',
    data: { position: 'bottom', icon: 'notification', class: 'notification' },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/notifications/notifications.module').then(
        (m) => m.NotificationsModule
      ),
  },
  {
    title: 'NotFoundPage',
    path: '**',
    component: NotFoundPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
