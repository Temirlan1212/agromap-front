import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContourAddComponent } from './components/contour-add/contour-add.component';
import { ArableLandComponent } from './arable-land.component';
import { AuthGuard } from '../../auth.guard';
import { SplitMapSidebarComponent } from './components/split-map-sidebar/split-map-sidebar.component';
import { ContourEditComponent } from './components/contour-edit/contour-edit.component';

const routes: Routes = [
  {
    path: '',
    component: ArableLandComponent,
    children: [
      {
        path: 'contour-add',
        component: ContourAddComponent,
        canActivate: [AuthGuard],
      },
      { path: 'split-map', component: SplitMapSidebarComponent },
      {
        path: 'contour-edit/:id',
        component: ContourEditComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArableLandRoutingModule {}
