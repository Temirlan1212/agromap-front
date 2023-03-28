import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/modules/api/api.service';
import { IRegion } from 'src/modules/api/models/region.model';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { IConton } from '../../../../../api/models/conton.model';
import { IDistrict } from '../../../../../api/models/district.model';
import { Subscription } from 'rxjs';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ContourFiltersQuery } from '../../../../../api/models/contour.model';
import { GeoJSON, geoJSON, geoJson, latLng, latLngBounds, Map } from 'leaflet';
import { MapService } from '../../map.service';
import { MapData, MapLayerFeature } from '../../../../../ui/models/map.model';
import { Feature } from 'geojson';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  mapInstance!: Map;
  mapGeo!: GeoJSON;
  filteredContours: any = [];
  currentFeature!: Feature;
  currentLang: string = this.translateSvc.currentLang;
  @Output() onCardClick = new EventEmitter<MapLayerFeature>();
  @Output() onEditClick = new EventEmitter<void>();

  form: FormGroup = new FormGroup({
    region: new FormControl<string | null>(null, { nonNullable: true, validators: Validators.required }),
    district: new FormControl<string | null>({ value: null, disabled: true }, {
      nonNullable: true,
      validators: Validators.required
    }),
    conton: new FormControl<string | null>({ value: null, disabled: true }, {
      nonNullable: true,
      validators: Validators.required
    }),
    land_type: new FormControl<string | null>(null, { nonNullable: true }),
    year: new FormControl<number | null>(2022, { nonNullable: true })
  });

  subscriptions: Subscription[] = [
    this.form.get('region')?.valueChanges.subscribe(value => this.handleRegionChange(value)) as Subscription,
    this.form.get('district')?.valueChanges.subscribe(value => this.handleDistrictChange(value)) as Subscription,
    this.form.get('conton')?.valueChanges.subscribe(value => this.handleContonChange(value)) as Subscription,
    this.translateSvc.onLangChange.subscribe(res => this.currentLang = res.lang)
    this.mapService.map.subscribe((res: MapData | null) => {
      this.mapInstance = res?.map as Map;
      this.mapGeo = res?.geoJson as GeoJSON;
    })
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private mapService: MapService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslatePipe,
    private translateSvc: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.getRegions();
    this.getLandTypes();
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
      this.districts = await this.api.dictionary.getDistricts({ region_id: this.form.get('region')?.value });
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getContons() {
    try {
      this.contons = await this.api.dictionary.getContons({ district_id: this.form.get('district')?.value });
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

  handleFormReset(): void {
    this.form.reset();
    this.resetMapBounds();
    this.filteredContours = [];
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
    const { region, district, year, conton, land_type } = formState.value;
    try {
      const query: ContourFiltersQuery = { region, district, conton, land_type, year };
      this.filteredContours = await this.api.contour.getFilteredContours(query);
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleRegionChange(value: string | null) {
    const districtVal = this.form.get('district');
    if (value != null && districtVal?.disabled) {
      await this.getDistricts();
      districtVal?.enable({ emitEvent: false });
    } else if (value != null && districtVal?.enabled) {
      await this.getDistricts();
    } else {
      districtVal?.patchValue(null);
      districtVal?.disable({ emitEvent: false });
    }
  }

  async handleDistrictChange(value: string | null) {
    const contonVal = this.form.get('conton');
    if (value != null) {
      const district = await this.api.dictionary.getDistricts({ ids: value, polygon: true });
      this.mapInstance.fitBounds(geoJson(district[0]?.polygon).getBounds());
      await this.getContons();
      contonVal?.enable({ emitEvent: false });
    } else if (value != null && contonVal?.enabled) {
      await this.getContons();
    } else {
      contonVal?.patchValue(null, { emitEvent: false });
      contonVal?.disable({ emitEvent: false });
      this.resetMapBounds();
    }
  }

  async handleContonChange(value: string | null) {
    if (value != null) {
      await this.api.dictionary.getConstons({ ids: value, polygon: true });
    } else {
      this.resetMapBounds();
    }
  }

  handleContourClick(contour: any) {
    this.currentFeature = contour.contour_year.features[0];
    this.onCardClick.emit({ layer: geoJSON(this.currentFeature), feature: this.currentFeature });
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
    const initBounds = latLngBounds(
      latLng(44.0, 68.0),
      latLng(39.0, 81.0)
    );
    this.mapInstance.fitBounds(initBounds);
    this.mapInstance.setMaxBounds(initBounds);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
