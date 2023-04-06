import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  form: FormGroup = new FormGroup({
    old_password: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
    password_confirm: new FormControl<string | null>(null, Validators.required),
  });
  oldPasswordShow: boolean = false;
  passwordShow: boolean = false;
  confirmPasswordShow: boolean = false;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {}

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  async resetPassword() {
    const formState = this.getState();
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    if (formState.value.password !== formState.value.password_confirm) {
      this.messages.warning(
        this.translate.transform('Passwords do not match, please retype')
      );
      return;
    }
    try {
    } catch (e) {
    } finally {
    }
  }
}
