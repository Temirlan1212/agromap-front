import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DictionaryComponent } from './dictionary.component';
import { CulturesComponent } from './cultures/cultures.component';
import { CultureAddComponent } from './cultures/components/culture-add/culture-add.component';
import { CultureEditComponent } from './cultures/components/culture-edit/culture-edit.component';

const routes: Routes = [
  {
    path: '',
    component: DictionaryComponent,
    children: [
      {
        path: '',
        redirectTo: 'cultures',
        pathMatch: 'full'
      },
      {
        path: 'cultures',
        component: CulturesComponent,
        children: [
          {
            path: 'add',
            component: CultureAddComponent
          },
          {
            path: ':id',
            component: CultureEditComponent
          },
        ]
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DictionaryRoutingModule {
}
