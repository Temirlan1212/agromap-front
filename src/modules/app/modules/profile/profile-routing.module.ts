import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CreateDatasetComponent } from './components/create-dataset/create-dataset.component';
import { IsSuperAdminGuard } from '../../is-super-admin.guard';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'edit',
        pathMatch: 'full',
      },
      {
        path: 'edit',
        component: EditProfileComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      },
      {
        path: 'create-dataset',
        component: CreateDatasetComponent,
        canActivate: [IsSuperAdminGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
