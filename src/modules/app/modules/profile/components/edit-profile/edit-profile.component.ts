import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { IProfile } from '../../../../../api/models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  form: FormGroup = new FormGroup({
    full_name: new FormControl<string | null>(null),
    phone_number: new FormControl<string | null>(null),
  });
  userId!: number;
  user!: IProfile;

  constructor(private api: ApiService, private messages: MessagesService) {}

  async ngOnInit() {
    this.userId = this.api.user.getLoggedInUser()?.user_id as number;
    try {
      this.user = await this.api.user.getUser();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }
}
