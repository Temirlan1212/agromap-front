import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

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
    title: 'Reports',
    path: 'reports',
    data: { position: 'top', icon: 'reports', authenticated: true },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    title: 'Dictionary',
    path: 'dictionary',
    data: { position: 'top', icon: 'dictionary', authenticated: true },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/dictionary/dictionary.module').then(
        (m) => m.DictionaryModule
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
