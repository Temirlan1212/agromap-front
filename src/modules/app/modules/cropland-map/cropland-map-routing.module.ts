import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContourAddComponent } from './components/contour-add/contour-add.component';
import { CroplandMapComponent } from './cropland-map.component';
import { AuthGuard } from '../../auth.guard';
import { SplitMapSidebarComponent } from './components/split-map-sidebar/split-map-sidebar.component';
import { ContourEditComponent } from './components/contour-edit/contour-edit.component';

const routes: Routes = [
  {
    path: '',
    component: CroplandMapComponent,
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
export class CroplandMapRoutingModule {}
