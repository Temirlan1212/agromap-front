import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent {
  form: FormGroup = new FormGroup({
    full_name: new FormControl<string | null>(null),
    phone_number: new FormControl<string | null>(null),
  });

  constructor(private api: ApiService) {}
}
