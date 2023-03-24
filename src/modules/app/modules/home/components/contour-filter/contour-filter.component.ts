import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/modules/api/api.service';
import { IRegion } from 'src/modules/api/models/region.model';

@Component({
  selector: 'app-contour-filter',
  templateUrl: './contour-filter.component.html',
  styleUrls: ['./contour-filter.component.scss'],
})
export class ContourFilterComponent implements OnInit {
  regions: IRegion[] = [];

  form: FormGroup = new FormGroup({
    region: new FormControl<[] | null>(null, {
      nonNullable: true,
      validators: Validators.required,
    }),
    district: new FormControl<[] | null>(
      { value: null, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),
    conton: new FormControl<[] | null>(
      { value: null, disabled: true },
      {
        nonNullable: true,
        validators: Validators.required,
      }
    ),
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getRegions();
  }

  async getRegions(): Promise<void> {
    try {
      this.regions = await this.api.dictionary.getRegions({ polygon: false }) as IRegion[];
      console.log(this.regions);
    } catch (e: any) {
      console.log(e);
    }
  }

  handleFormReset(): void {
    this.form.reset();
  }

  handleFormSubmit(): void {
    console.log(this.form);
  }
}
