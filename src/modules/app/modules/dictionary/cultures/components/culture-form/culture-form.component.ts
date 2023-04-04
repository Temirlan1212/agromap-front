import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../../api/api.service';
import { ICulture } from '../../../../../../api/models/culture.model';

@Component({
  selector: 'app-culture-form',
  templateUrl: './culture-form.component.html',
  styleUrls: ['./culture-form.component.scss']
})
export class CultureFormComponent {
  form: FormGroup = new FormGroup({
    name_ru: new FormControl<string | null>(null, Validators.required),
    name_en: new FormControl<string | null>(null, Validators.required),
    name_ky: new FormControl<string | null>(null, Validators.required),
    coefficient_crop: new FormControl<number | null>(null, Validators.required)
  });

  @Input() set value(v: Partial<ICulture> | null) {
    if (v == null) {
      this.form.reset();
    } else {
      this.form.patchValue({
        name_ru: v.name_ru,
        name_en: v.name_en,
        name_ky: v.name_ky,
        coefficient_crop: v.coefficient_crop
      });
    }
  }

  constructor(private api: ApiService) {
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }
}
