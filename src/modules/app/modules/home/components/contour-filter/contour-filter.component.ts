import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/modules/api/api.service';
import { IRegion } from 'src/modules/api/models/region.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { IConton } from '../../../../../api/models/conton.model';
import { IDistrict } from '../../../../../api/models/district.model';
import { filter, Subscription } from 'rxjs';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ContourFiltersQuery } from '../../../../../api/models/contour.model';
import { GeoJSON, geoJSON, geoJson, latLng, latLngBounds, Map } from 'leaflet';
import { MapService } from '../../../../../ui/services/map.service';
import { MapData, MapLayerFeature } from '../../../../../ui/models/map.model';
import { Feature } from 'geojson';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QuestionDialogComponent } from '../../../../../ui/components/question-dialog/question-dialog.component';
import { StoreService } from 'src/modules/ui/services/store.service';
import { ICulture } from '../../../../../api/models/culture.model';

@Component({
  selector: 'app-contour-filter',
  templateUrl: './contour-filter.component.html',
  styleUrls: ['./contour-filter.component.scss'],
})
export class ContourFilterComponent implements OnInit, OnDestroy {
  regions: IRegion[] = [];
  contons: IConton[] = [];
  districts: IDistrict[] = [];
  landTypes: ILandType[] = [];
  cultures: ICulture[] = [];
  mapInstance!: Map;
  mapGeo!: GeoJSON;
  filteredContours: any = [];
  currentFeature!: Feature;
  currentLang: string = this.translateSvc.currentLang;
  selectedId: number | null = null;
  filtersQuery!: ContourFiltersQuery;
  radioOptions: any = [
    { name: 'AI', value: 'agromap_store_ai' },
    { name: 'Base', value: 'agromap_store' },
  ];
  @Output() onCardClick = new EventEmitter<MapLayerFeature>();
  @Output() onEditClick = new EventEmitter<void>();
  @Output() onModeChanged = new EventEmitter<string>();
  @Output() onFormSubmit = new EventEmitter<Record<string, any>>();
  @Output() onFormReset = new EventEmitter<Record<string, any>>();
  loading: boolean = false;
  form: FormGroup = new FormGroup({
    region: new FormControl<string | null>(null, {
      nonNullable: true,
    }),
    district: new FormControl<string | null>(
      { value: null, disabled: true },
      {
        nonNullable: true,
      }
    ),
    conton: new FormControl<string | null>(
      { value: null, disabled: true },
      {
        nonNullable: true,
      }
    ),
    land_type: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: Validators.required,
    }),
    culture: new FormControl<string | null>(null, { nonNullable: true }),
    year: new FormControl<number | null>(2022, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  mode: FormControl = new FormControl<string | null>(null);

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
    this.form
      .get('conton')
      ?.valueChanges.subscribe((value) =>
        this.handleContonChange(value)
      ) as Subscription,
    this.mode?.valueChanges.pipe(filter((res) => !!res)).subscribe((value) => {
      this.onModeChanged.emit(value);
    }) as Subscription,
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
    this.mapService.map.subscribe((res: MapData | null) => {
      this.mapInstance = res?.map as Map;
      this.mapGeo = res?.geoJson as GeoJSON;
    }),
    this.store.watchItem('MapControlLayersSwitchComponent').subscribe((v) => {
      this.mode?.patchValue(v.filterControlLayerSwitch?.oldValue, {
        emitEvent: false,
      });
    }),
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private mapService: MapService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslatePipe,
    private translateSvc: TranslateService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    if (
      this.store.getItem('MapControlLayersSwitchComponent')
        ?.filterControlLayerSwitch.name == null
    ) {
      this.mode?.patchValue('agromap_store_ai');
    }
    this.getRegions();
    this.getLandTypes();
    this.getCultures();
  }

  async getRegions(): Promise<void> {
    try {
      this.regions = await this.api.dictionary.getRegions({ polygon: false });
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getDistricts() {
    try {
      const results = (await this.api.dictionary.getDistricts({
        region_id: this.form.get('region')?.value,
        polygon: true,
      })) as IDistrict[];
      this.districts = results;
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getContons() {
    try {
      this.contons = (await this.api.dictionary.getContons({
        district_id: this.form.get('district')?.value,
        polygon: true,
      })) as IConton[];
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getLandTypes() {
    try {
      this.landTypes = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getCultures() {
    try {
      this.cultures = await this.api.culture.getList();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  handleFormReset(): void {
    this.form.reset();
    this.resetMapBounds();
    this.filteredContours = [];
    this.onFormReset.emit();
    this.store.setItem<ContourFiltersQuery | null>(
      'ContourFilterComponent',
      null
    );
  }

  handleEditClick(contour: any) {
    const id = contour.contour_year.features[0].properties['contour_id'];
    this.onEditClick.emit();
    this.router.navigate(['contour-edit', id], { relativeTo: this.route });
  }

  async handleFormSubmit(): Promise<void> {
    const formState = this.getState();
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    this.onFormSubmit.emit(formState);
    const { region, district, year, conton, land_type, culture } =
      formState.value;
    this.loading = true;
    try {
      this.filtersQuery = {
        ...(region && { region }),
        ...(district && { district }),
        ...(conton && { conton }),
        land_type,
        culture,
        year,
        ...(this.mode.value == 'agromap_store_ai' && { ai: true }),
      };
      // this.filteredContours = await this.api.contour.getFilteredContours(
      //   this.filtersQuery
      // );
      this.store.setItem<ContourFiltersQuery | null>(
        'ContourFilterComponent',
        this.filtersQuery
      );
    } catch (e: any) {
      this.messages.error(e.message);
    } finally {
      this.loading = false;
    }
  }

  async handleRegionChange(value: string | null) {
    const districtVal = this.form.get('district');
    const region = this.regions.find((r) => r.id == Number(value));
    region &&
      this.mapInstance.fitBounds(geoJson(region?.polygon).getBounds(), {
        maxZoom: 12,
      });
    if (value != null && districtVal?.disabled) {
      await this.getDistricts();
      districtVal?.enable({ emitEvent: false });
    } else if (value != null && districtVal?.enabled) {
      await this.getDistricts();
    } else {
      districtVal?.patchValue(null);
      districtVal?.disable({ emitEvent: false });
      this.resetMapBounds();
    }
  }

  async handleDistrictChange(value: string | null) {
    const contonVal = this.form.get('conton');
    if (value != null) {
      const district = (await this.api.dictionary.getDistricts({
        ids: value,
        polygon: true,
      })) as IDistrict[];
      this.mapInstance.fitBounds(geoJson(district[0]?.polygon).getBounds());
      await this.getContons();
      contonVal?.enable({ emitEvent: false });
    } else if (value != null && contonVal?.enabled) {
      await this.getContons();
    } else {
      contonVal?.patchValue(null, { emitEvent: false });
      contonVal?.disable({ emitEvent: false });
    }
  }

  async handleContonChange(value: string | null) {
    if (value != null) {
      const res = (await this.api.dictionary.getContons({
        ids: value,
        polygon: true,
      })) as IConton[];
      this.mapInstance.fitBounds(geoJson(res[0]?.polygon).getBounds(), {
        maxZoom: 12,
      });
    } else {
      this.resetMapBounds();
    }
  }

  handleContourClick(contour: any) {
    this.currentFeature = contour.contour_year.features[0];
    this.onCardClick.emit({
      layer: geoJSON(this.currentFeature),
      feature: this.currentFeature,
    });
    this.mapInstance.fitBounds(geoJson(this.currentFeature).getBounds());
  }

  public getState(): { value: any; valid: boolean; touched: boolean } {
    const state = this.api.form.getState(this.form);
    return state;
  }

  public setError(error: Record<string, any>): void {
    this.api.form.setError(error, this.form);
  }

  resetMapBounds() {
    const initBounds = latLngBounds(latLng(44.0, 68.0), latLng(39.0, 81.0));
    this.mapInstance.fitBounds(initBounds);
    this.mapInstance.setMaxBounds(initBounds);
  }

  handleContourDelete(contour: number, dialog: QuestionDialogComponent) {
    this.selectedId = contour;
    dialog.show();
  }

  async deleteItem(): Promise<void> {
    try {
      await this.api.contour.remove(this.selectedId as number);
      this.filteredContours = await this.api.contour.getFilteredContours(
        this.filtersQuery
      );
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleDeleteSubmitted(dialog: QuestionDialogComponent): Promise<void> {
    await this.deleteItem();
    this.selectedId = null;
    dialog.close();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
