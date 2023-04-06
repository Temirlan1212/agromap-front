import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';

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

  constructor(private api: ApiService, private messages: MessagesService) {}

  async ngOnInit() {
    this.getUser();
  }

  async getUser() {
    try {
      const user = await this.api.user.getUser();
      this.form.setValue({
        full_name: user.full_name,
        phone_number: user.phone_number,
      });
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleSaveClick() {
    try {
      await this.api.user.updateProfile(this.form.value);
      await this.getUser();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }
}
