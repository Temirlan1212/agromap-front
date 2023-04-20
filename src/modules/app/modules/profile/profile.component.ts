import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';
import { IUser } from '../../../api/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  currentUser!: IUser | null;

  constructor(private api: ApiService, private router: Router) {
    this.currentUser = this.api.user.getLoggedInUser();
  }

  async handleLogoutClick(): Promise<void> {
    await this.api.user.logOut();
    this.router.navigate(['']);
  }
}
