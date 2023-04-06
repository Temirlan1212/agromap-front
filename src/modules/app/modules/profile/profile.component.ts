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

  handleLogoutClick(): void {
    this.api.user.logOut();
    this.router.navigate(['']);
  }

  async handleSaveClick(): Promise<void> {
    try {
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }
}
