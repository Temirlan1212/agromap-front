import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';
import { IProfile } from '../../../../../api/models/user.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup = new FormGroup({
    old_password: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
    password_confirm: new FormControl<string | null>(null, Validators.required),
  });
  oldPasswordShow: boolean = false;
  passwordShow: boolean = false;
  confirmPasswordShow: boolean = false;
  userId!: number;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {}

  ngOnInit() {
    this.userId = this.api.user.getLoggedInUser()?.user_id as number;
  }

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
