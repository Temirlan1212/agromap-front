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
  form: FormGroup = new FormGroup({
    full_name: new FormControl<string | null>(null, Validators.required),
    phone_number: new FormControl<string | null>(null, Validators.required),
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
      this.messages.error(e.message);
    }
  }

  async handleSaveClick() {
    const formState = this.getState();
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    try {
      await this.api.user.updateProfile(this.form.value);
      await this.getUser();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }
}
