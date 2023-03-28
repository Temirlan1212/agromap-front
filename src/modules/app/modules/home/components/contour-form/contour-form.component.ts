import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IConton, IContonListQuery } from '../../../../../api/models/conton.model';
import { ApiService } from '../../../../../api/api.service';
import { IDistrict } from '../../../../../api/models/district.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IRegion } from '../../../../../api/models/region.model';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ICulture } from '../../../../../api/models/culture.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';

@Component({
  selector: 'app-contour-form',
  templateUrl: './contour-form.component.html',
  styleUrls: ['./contour-form.component.scss']
})
export class ContourFormComponent implements OnInit, OnDestroy {
  contonList: IConton[] = [];
  districtList: IDistrict[] = [];
  regionList: IRegion[] = [];
  landTypeList: ILandType[] = [];
  cultureList: ICulture[] = [];

  @Input() set value(v: any | null) {
    if (v == null) {
      this.form.reset();
    } else {
      this.form.patchValue({
        conton: v.properties.conton,
        type: v.properties.type,
        culture: v.properties.culture,
        productivity: v.properties.productivity,
        year: v.properties.year,
        code_soato: v.properties.code_soato,
        ink: v.properties.ink
      });
    }
  }

  form: FormGroup = new FormGroup({
    region: new FormControl<string | number | null>({ value: null, disabled: true }),
    district: new FormControl<string | number | null>({ value: null, disabled: true }),
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
    this.form.get('conton')?.valueChanges.subscribe(res => {
      if (res) {
        const selectedConton = this.contonList.find(c => c.id === res);
        this.form.patchValue({ district: selectedConton?.district, region: selectedConton?.region });
      } else {
        this.form.patchValue({ district: null, region: null });
      }
    }) as Subscription,
    this.form.get('type')?.valueChanges.subscribe(res => {
      if (res && res === 1) {
        this.form.get('culture')?.disable();
        this.form.get('culture')?.patchValue(null);
      } else {
        this.form.get('culture')?.enable();
      }
    }) as Subscription
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService) {
  }

  ngOnInit() {
    this.getRegions();
    this.getDistricts();
    this.getContons();
    this.getCultures();
    this.getLandTypes();
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
      polygon: true
    };
    try {
      const res = await this.api.dictionary.getContons(query);
      this.contonList = res;
      if (this.form.get('conton')?.value != null) {
        const selectedConton = this.contonList.find(c => c.id === this.form.get('conton')?.value);
        this.form.patchValue({ district: selectedConton?.district, region: selectedConton?.region });
      }
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getDistricts() {
    try {
      const res = await this.api.dictionary.getDistricts();
      this.districtList = res;
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getRegions() {
    try {
      const res = await this.api.dictionary.getRegions() as IRegion[];
      this.regionList = res;
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getLandTypes() {
    try {
      const res = await this.api.dictionary.getLandType();
      this.landTypeList = res;
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getCultures() {
    try {
      const res = await this.api.culture.getList();
      this.cultureList = res;
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  ngOnDestroy() {
    this.formSubscriptions.forEach(s => s.unsubscribe());
  }
}
