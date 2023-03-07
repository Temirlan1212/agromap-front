import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';

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

  constructor(private api: ApiService, private router: Router) {}

  async handleFormSubmit(): Promise<void> {
    const state = this.api.form.getState(this.form);

    if (!state.valid || !state.touched) {
      this.api.form.setError({ 'user-data': 'Incorrect user data' }, this.form);
      return;
    }

    try {
      await this.api.user.logIn(state.value);
      await this.router.navigate(['']);
    } catch (e: any) {
      this.api.form.setError({ 'user-data': 'Incorrect user data' }, this.form);
    }
  }
}
