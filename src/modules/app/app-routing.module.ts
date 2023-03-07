import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    title: 'GiproZem',
    path: '',
    data: { position: 'top', image: 'logo.png' },
    redirectTo: 'analytics',
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
export class AppRoutingModule {}
