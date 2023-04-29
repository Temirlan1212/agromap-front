import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DictionaryComponent } from './dictionary.component';
import { CulturesComponent } from './cultures/cultures.component';
import { CultureAddComponent } from './cultures/components/culture-add/culture-add.component';
import { CultureEditComponent } from './cultures/components/culture-edit/culture-edit.component';
import { RegionsComponent } from './regions/regions.component';
import { DistrictsComponent } from './districts/districts.component';
import { ContonsComponent } from './contons/contons.component';
import { IndexesComponent } from './indexes/indexes.component';
import { AuthGuard } from '../../auth.guard';
import { SoilTypesComponent } from './soil-types/soil-types.component';

const routes: Routes = [
  {
    path: '',
    component: DictionaryComponent,
    children: [
      {
        path: '',
        redirectTo: 'regions',
        pathMatch: 'full',
      },
      {
        path: 'cultures',
        component: CulturesComponent,
        children: [
          {
            path: 'add',
            component: CultureAddComponent,
            canActivate: [AuthGuard],
          },
          {
            path: ':id',
            component: CultureEditComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'regions',
        component: RegionsComponent,
      },
      {
        path: 'districts',
        component: DistrictsComponent,
      },
      {
        path: 'contons',
        component: ContonsComponent,
      },
      {
        path: 'indexes',
        component: IndexesComponent,
      },
      {
        path: 'soil-types',
        component: SoilTypesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DictionaryRoutingModule {}
