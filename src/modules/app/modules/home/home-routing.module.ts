import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContourAddComponent } from './components/contour-add/contour-add.component';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../../auth.guard';
import { ContourEditComponent } from './components/contour-edit/contour-edit.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'contour-add', component: ContourAddComponent, canActivate: [AuthGuard] },
      { path: 'contour-edit/:id', component: ContourEditComponent, canActivate: [AuthGuard] },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {
}
