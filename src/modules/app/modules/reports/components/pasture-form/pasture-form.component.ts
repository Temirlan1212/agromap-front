import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { IRegion } from '../../../../../api/models/region.model';
import { IConton } from '../../../../../api/models/conton.model';
import { IDistrict } from '../../../../../api/models/district.model';
import { ILandType } from '../../../../../api/models/land-type.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pasture-form',
  templateUrl: './pasture-form.component.html',
  styleUrls: ['./pasture-form.component.scss'],
})
export class PastureFormComponent implements OnInit {
  form: FormGroup = new FormGroup({
    region: new FormControl<number | null>(null),
    district: new FormControl<string | null>({ value: null, disabled: true }),
    conton: new FormControl<string | null>({ value: null, disabled: true }),
    year: new FormControl<string | null>('2022', { nonNullable: true }),
    land_type: new FormControl<string | null>('2'),
  });

  regions: IRegion[] = [];
  contons: IConton[] = [];
  districts: IDistrict[] = [];

  subscriptions: Subscription[] = [
    this.form
      .get('region')
      ?.valueChanges.subscribe((value) =>
        this.handleRegionChange(value)
      ) as Subscription,
    this.form
      .get('district')
      ?.valueChanges.subscribe((value) =>
        this.handleDistrictChange(value)
      ) as Subscription,
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {}

  async getRegions(): Promise<void> {
    try {
      this.regions = await this.api.dictionary.getRegions();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getDistricts(regionId?: number) {
    const query = {
      ...(regionId && { region_id: regionId }),
    };
    try {
      this.districts = await this.api.dictionary.getDistricts(query);
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getContons() {
    const district_id = this.form.get('district')?.value;
    try {
      this.contons = await this.api.dictionary.getContons({
        district_id: district_id ? this.form.get('district')?.value : '',
      });
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleRegionChange(value: number | null) {
    const districtVal = this.form.get('district');
    if (value != null && districtVal?.disabled) {
      await this.getDistricts(value);
      districtVal?.enable({ emitEvent: false });
    } else if (value != null && districtVal?.enabled) {
      await this.getDistricts();
    } else {
      districtVal?.patchValue(null);
      districtVal?.disable({ emitEvent: false });
    }
  }

  async handleDistrictChange(value: number | null) {
    const contonVal = this.form.get('conton');
    if (value != null) {
      await this.getContons();
      contonVal?.enable({ emitEvent: false });
    } else if (value != null && contonVal?.enabled) {
      await this.getContons();
    } else {
      contonVal?.patchValue(null, { emitEvent: false });
      contonVal?.disable({ emitEvent: false });
    }
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  ngOnInit() {
    this.getRegions();
    this.form.get('region')?.setValue(3);
  }
}
