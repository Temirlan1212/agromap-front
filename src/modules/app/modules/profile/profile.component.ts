import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';
import { MessagesService } from '../../../ui/components/services/messages.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  constructor(
    private api: ApiService,
    private router: Router,
    private messages: MessagesService
  ) {}

  async handleLogoutClick(): Promise<void> {
    await this.api.user.logOut();
    this.router.navigate(['']);
  }
}
