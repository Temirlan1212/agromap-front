import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  IConton,
  IContonListQuery,
} from '../../../../../api/models/conton.model';
import { ApiService } from '../../../../../api/api.service';
import {
  IDistrict,
  IDistrictWithPagination,
} from '../../../../../api/models/district.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IRegion } from '../../../../../api/models/region.model';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ICulture } from '../../../../../api/models/culture.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
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
    region: new FormControl<string | number | null>({
      value: null,
      disabled: true,
    }),
    district: new FormControl<string | number | null>({
      value: null,
      disabled: true,
    }),
    conton: new FormControl<string | number | null>(null, Validators.required),
    type: new FormControl<string | number | null>(null),
    culture: new FormControl<string | number | null>(null),
    productivity: new FormControl<number | null>(null),
    year: new FormControl<number | null>(null, Validators.required),
    code_soato: new FormControl<string | null>(null, Validators.required),
    ink: new FormControl<string | null>(null),
  });
  @Output() onChange = new EventEmitter<any>();

  formSubscriptions: Subscription[] = [
    this.form.get('conton')?.valueChanges.subscribe((res) => {
      if (res) {
        const selectedConton = this.contonList.find((c) => c.id === res);
        this.form.patchValue({
          district: selectedConton?.district,
          region: selectedConton?.region,
        });
      } else {
        if (this.mode != 'agromap_store_ai') {
          this.form.patchValue({ district: null, region: null });
        }
      }
    }) as Subscription,
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
    await this.getRegions();
    await this.getDistricts();
    await this.getContons();
    await this.getCultures();
    await this.getLandTypes();
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
    const query: IContonListQuery = {
      polygon: true,
    };
    try {
      const res = (await this.api.dictionary.getContons(query)) as IConton[];
      this.contonList = res;
      if (this.form.get('conton')?.value != null) {
        const selectedConton = this.contonList.find(
          (c) => c.id === this.form.get('conton')?.value
        );
        this.form.patchValue({
          district: selectedConton?.district,
          region: selectedConton?.region,
        });
      }
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async getDistricts() {
    try {
      const results = (await this.api.dictionary.getDistricts({
        polygon: true,
      })) as IDistrict[];
      this.districtList = results;
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
