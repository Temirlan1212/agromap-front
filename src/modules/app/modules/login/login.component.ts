import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/modules/api/api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup = new FormGroup({
    username: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: Validators.required,
    }),
    password: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  constructor(private api: ApiService, private location: Location) {}

  async handleFormSubmit(): Promise<void> {
    const state = this.api.form.getState(this.form);

    if (!state.valid || !state.touched) {
      this.api.form.setError({ 'user-data': 'Incorrect user data' }, this.form);
      return;
    }

    try {
      await this.api.user.logIn(state.value);
      this.location.back();
    } catch (e: any) {
      this.api.form.setError({ 'user-data': 'Incorrect user data' }, this.form);
    }
  }
}
