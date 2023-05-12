import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../../api/api.service';
import { IRegion } from '../../../../../api/models/region.model';
import { IConton } from '../../../../../api/models/conton.model';
import {
  IDistrict,
  IDistrictWithPagination,
} from '../../../../../api/models/district.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ILandType } from 'src/modules/api/models/land-type.model';
import { ICulture } from 'src/modules/api/models/culture.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
})
export class LandTypeFormComponent implements OnInit, OnDestroy {
  get(arg0: string) {
    throw new Error('Method not implemented.');
  }
  form: FormGroup = new FormGroup({
    region: new FormControl<number | null>(null),
    district: new FormControl<string | null>({ value: null, disabled: true }),
    conton: new FormControl<string | null>({ value: null, disabled: true }),
    year: new FormControl<string | null>('2022', { nonNullable: true }),
    land_type: new FormControl<number | null>(null),
    culture: new FormControl<number | null>(null),
  });

  regions: IRegion[] = [];
  contons: IConton[] = [];
  districts: IDistrict[] = [];
  land_types: ILandType[] = [];
  cultures: ICulture[] = [];

  currLang: string = this.translateSvc.currentLang;

  @Input() culture: boolean = false;

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

    this.translateSvc.onLangChange.subscribe(
      (lang) => (this.currLang = lang.lang)
    ) as Subscription,
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private translateSvc: TranslateService
  ) {}

  async getRegions(): Promise<void> {
    try {
      this.regions = await this.api.dictionary.getRegions();
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  async getDistricts(regionId?: number) {
    if (!regionId) return;
    const query = {
      ...(regionId && { region_id: regionId, polygon: true }),
    };
    try {
      const res = (await this.api.dictionary.getDistricts(
        query
      )) as IDistrict[];
      this.districts = res;
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  async getContons() {
    const district_id = this.form.get('district')?.value;
    try {
      this.contons = (await this.api.dictionary.getContons({
        district_id: district_id ? this.form.get('district')?.value : '',
        polygon: true,
      })) as IConton[];
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  async getLandType() {
    try {
      this.land_types = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  async getCulture() {
    try {
      this.cultures = await this.api.culture.getList();
    } catch (e: any) {
      this.messages.error(e?.error?.message ? e?.error?.message : e?.message);
    }
  }

  async handleRegionChange(value: number | null) {
    const districtVal = this.form.get('district');
    if (value != null) {
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
    this.getLandType();
    this.getCulture();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
