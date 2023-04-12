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
          },
          {
            path: ':id',
            component: CultureEditComponent,
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DictionaryRoutingModule {}
