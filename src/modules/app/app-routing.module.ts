import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    title: 'GiproZem',
    path: '',
    data: { position: 'top', image: 'logo.png', class: 'homepage' },
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    title: 'Login',
    path: 'login',
    loadChildren: () =>
      import('src/modules/app/modules/login/login.module').then(
        (m) => m.LoginModule
      ),
  },
  {
    title: 'Home',
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    title: 'Analytics',
    path: 'analytics',
    data: { position: 'top', icon: 'analytics' },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/analytics/analytics.module').then(
        (m) => m.AnalyticsModule
      ),
  },
  {
    title: 'Reports',
    path: 'reports',
    data: { position: 'top', icon: 'reports' },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    title: 'Profile',
    path: 'profile',
    data: { position: 'bottom', icon: 'user' },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/profile/profile.module').then((m) => m.ProfileModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
