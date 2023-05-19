import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IConton } from '../../../../../api/models/conton.model';
import { ApiService } from '../../../../../api/api.service';
import { IDistrict } from '../../../../../api/models/district.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IRegion } from '../../../../../api/models/region.model';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ICulture } from '../../../../../api/models/culture.model';
import { MessagesService } from '../../../../../ui/services/messages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contour-form',
  templateUrl: './contour-form.component.html',
  styleUrls: ['./contour-form.component.scss'],
})
export class ContourFormComponent implements OnInit, OnDestroy {
  contonList: IConton[] = [];
  districtList: IDistrict[] = [];
  regionList: IRegion[] = [];
  landTypeList: ILandType[] = [];
  cultureList: ICulture[] = [];
  currentLang: string = this.translateSvc.currentLang;
  loading: boolean = false;
  @Input() mode!: string | null;

  @Input() set value(v: any | null) {
    if (v == null) {
      this.form.reset();
    } else {
      this.form.patchValue({
        region: v.region?.id,
        district: v.district?.id,
        conton: v.conton?.id,
        type: v.type?.id,
        culture: v.culture?.id,
        productivity: v.productivity,
        year: v.year,
        code_soato: v.code_soato,
        ink: v.ink,
        ...(this.mode == 'agromap_store_ai' && { district: v.district?.id }),
        ...(this.mode == 'agromap_store_ai' && { region: v.region?.id }),
      });
    }
  }

  form: FormGroup = new FormGroup({
    region: new FormControl<number | null>(null),
    district: new FormControl<string | null>({ value: null, disabled: true }),
    conton: new FormControl<string | null>({ value: null, disabled: true }),
    type: new FormControl<string | number | null>(null),
    culture: new FormControl<string | number | null>(null),
    productivity: new FormControl<number | null>(null),
    year: new FormControl<number | null>(null, Validators.required),
    code_soato: new FormControl<string | null>(null, Validators.required),
    ink: new FormControl<string | null>(null, Validators.required),
  });
  @Output() onChange = new EventEmitter<any>();

  formSubscriptions: Subscription[] = [
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

    this.form.get('type')?.valueChanges.subscribe((res) => {
      if (res && res === 2) {
        this.form.get('culture')?.disable();
        this.form.get('culture')?.patchValue(null);
      } else {
        this.form.get('culture')?.enable();
      }
    }) as Subscription,
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.getLandTypes();
    await this.getCultures();
    await this.getRegions();
    this.getDistricts();
    this.getContons();
    this.form.get('type')?.setValue(String(this.landTypeList[0].id));
    this.loading = false;
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  public setError(error: Record<string, any>): void {
    this.api.form.setError(error, this.form);
  }

  async getContons() {
    const district_id = this.form.get('district')?.value;
    try {
      this.contonList = (await this.api.dictionary.getContons({
        district_id: district_id ? this.form.get('district')?.value : '',
        polygon: true,
      })) as IConton[];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
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

  async getDistricts(regionId?: number) {
    if (!regionId) return;
    const query = {
      ...(regionId && { region_id: regionId, polygon: true }),
    };
    try {
      const res = (await this.api.dictionary.getDistricts(
        query
      )) as IDistrict[];
      this.districtList = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async getRegions() {
    try {
      const res = (await this.api.dictionary.getRegions()) as IRegion[];
      this.regionList = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async getLandTypes() {
    try {
      const res = await this.api.dictionary.getLandType();
      this.landTypeList = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async getCultures() {
    try {
      const res = await this.api.culture.getList();
      this.cultureList = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  ngOnDestroy() {
    this.formSubscriptions.forEach((s) => s.unsubscribe());
  }
}
