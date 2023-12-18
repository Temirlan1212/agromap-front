import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ApiService } from '../../../../../api/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
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
        type: v.type?.id,
        culture: v.culture?.id,
        productivity: v.productivity,
        year: v.year,
        code_soato: v.code_soato,
        ink: v.ink,
        eni: v.eni,
      });
    }
  }

  form: FormGroup = new FormGroup({
    type: new FormControl<string | number | null>(null, Validators.required),
    culture: new FormControl<string | number | null>(null),
    productivity: new FormControl<number | null>(null),
    year: new FormControl<number | null>(null, Validators.required),
    code_soato: new FormControl<string | null>(null),
    ink: new FormControl<string | null>(null),
    eni: new FormControl<string | null>(null),
  });
  @Output() onChange = new EventEmitter<any>();

  formSubscriptions: Subscription[] = [
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
    this.loading = false;
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  public setError(error: Record<string, any>): void {
    this.api.form.setError(error, this.form);
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
