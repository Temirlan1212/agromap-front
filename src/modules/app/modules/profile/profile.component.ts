import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  form: FormGroup = new FormGroup({
    fullname: new FormControl<string | null>(null),
    phone: new FormControl<string | null>(null),
    password: new FormControl<string | null>(null),
  });

  constructor(private api: ApiService, private router: Router) {}

  handleLogoutClick(): void {
    this.api.user.logOut();
    this.router.navigate(['']);
  }
}
