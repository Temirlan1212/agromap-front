import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  loading: boolean = false;
  form: FormGroup = new FormGroup({
    full_name: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(/^(?!.* {2})[^0-9]*$/),
    ]),
    phone_number: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(9),
      Validators.minLength(9),
    ]),
  });

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {}

  async ngOnInit() {
    this.getUser();
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  async getUser() {
    try {
      const user = await this.api.user.getUser();
      this.form.setValue({
        full_name: user.full_name,
        phone_number: user.phone_number,
      });
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async handleSaveClick() {
    const formState = this.getState();
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    try {
      this.loading = true;
      await this.api.user.updateProfile(this.form.value);
      await this.getUser();
      this.messages.success(this.translate.transform('Successfully updated'));
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }
  }

  handleTelValidation(event: KeyboardEvent) {
    const { value } = event.target as HTMLInputElement;
    const pattern = /^[0-9]{0,8}$/;
    const isInvalidInput =
      event.key !== 'Backspace' &&
      (!pattern.test(value) || /[^\d]/.test(event.key));

    if (isInvalidInput) {
      event.preventDefault();
    }
  }
}
