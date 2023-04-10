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

@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileComponent,
    ResetPasswordComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    InputComponent,
    TranslateModule,
    SidePanelComponent,
    FormsModule,
  ],
  providers: [TranslatePipe],
})
export class ProfileModule {}
