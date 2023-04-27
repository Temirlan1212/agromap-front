import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../ui/components/input/input.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { FormFieldComponent } from '../../../ui/components/form-field/form-field.component';
import { CreateDatasetComponent } from './components/create-dataset/create-dataset.component';
import { QuestionDialogComponent } from '../../../ui/components/question-dialog/question-dialog.component';
import { SvgIconComponent } from '../../../ui/components/svg-icon/svg-icon.component';
import { IsSuperAdminGuard } from '../../is-super-admin.guard';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';

@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileComponent,
    ResetPasswordComponent,
    CreateDatasetComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    InputComponent,
    TranslateModule,
    SidePanelComponent,
    FormsModule,
    FormFieldComponent,
    QuestionDialogComponent,
    SvgIconComponent,
    ToggleButtonComponent,
  ],
  providers: [TranslatePipe, IsSuperAdminGuard],
})
export class ProfileModule {}
