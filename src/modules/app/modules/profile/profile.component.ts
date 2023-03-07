import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  constructor(private api: ApiService, private router: Router) {}

  handleLogoutClick(): void {
    this.api.user.logOut();
    this.router.navigate(['']);
  }
}
