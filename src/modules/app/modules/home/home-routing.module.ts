import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContourAddComponent } from './components/contour-add/contour-add.component';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../../auth.guard';
import { SplitMapSidebarComponent } from './components/split-map-sidebar/split-map-sidebar.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'contour-add', component: ContourAddComponent, canActivate: [AuthGuard] },
      { path: 'split-map', component: SplitMapSidebarComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {
}
