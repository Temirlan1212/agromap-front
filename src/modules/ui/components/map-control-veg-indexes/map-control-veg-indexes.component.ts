import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import {
  IVegIndexOption,
  IVegSatelliteDate,
} from 'src/modules/api/models/veg-indexes.model';
import { MapControlTabSliderComponent } from '../map-control-tab-slider/map-control-tab-slider.component';
import { MapData, MapLayerFeature } from '../../models/map.model';
import * as L from 'leaflet';
import { environment } from 'src/environments/environment';
import { Feature } from 'geojson';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from 'src/modules/ui/services/map.service';
import { geoJson } from 'leaflet';

@Component({
  selector: 'app-map-control-veg-indexes',
  templateUrl: './map-control-veg-indexes.component.html',
  styleUrls: ['./map-control-veg-indexes.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    DatePickerComponent,
    MapControlTabSliderComponent,
  ],
})
export class MapControlVegIndexesComponent
  implements DoCheck, OnDestroy, OnInit
{
  private vegIndexesDataDiffer: KeyValueDiffer<string, IVegSatelliteDate>;

  @ViewChild('vegIndexesDialog')
  vegIndexesDialogEl!: ElementRef<HTMLInputElement>;

  @ViewChild('dateDialog')
  dateDialogEl!: ElementRef<HTMLInputElement>;

  @ViewChild('timeline')
  timelineEl!: ElementRef<HTMLInputElement>;

  @Input() mapData: MapData | null = null;
  @Input() vegIndexesData: IVegSatelliteDate[] = [];
  @Input() vegIndexOptionsList: IVegIndexOption[] = [];
  @Input() defaultYear: number | null = null;

  @Input() loadingSatelliteDates: boolean = false;

  @Output() vegIndexOptionClick = new EventEmitter<IVegIndexOption>();
  @Output() onDateSelect = new EventEmitter<void>();

  @Input('polygon') set polygon(value: L.Polygon | undefined) {
    if (value) {
      this.bounds = geoJson(value as any).getBounds();
    }
    this.removeImageOverlay();
    this.selectedDate = null;
  }

  bounds: L.LatLngBounds | undefined;
  layerFeature: Feature | null = null;

  selectedDate: string | null = null;
  selectedVegOption: IVegIndexOption | null = null;

  imageOverlayIncstance: L.ImageOverlay | null = null;

  activeDates: string[] = [];

  isCollapsedIndexDialog = false;
  isCollapsedDateDialog = false;

  constructor(
    private differs: KeyValueDiffers,
    public translate: TranslateService,
    private mapServie: MapService
  ) {
    this.vegIndexesDataDiffer = this.differs.find(this.vegIndexesData).create();
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const vegIndexesDialogElClickedInside =
      this.vegIndexesDialogEl.nativeElement.contains(target);

    const dateElDialogClickedInside =
      this.dateDialogEl.nativeElement.contains(target);

    if (!vegIndexesDialogElClickedInside) this.isCollapsedIndexDialog = false;
    if (!dateElDialogClickedInside) this.isCollapsedDateDialog = false;
  }

  handleCollapseClick(type: string) {
    if (type === 'index') {
      this.isCollapsedIndexDialog = !this.isCollapsedIndexDialog;
    }

    if (type === 'date') {
      this.isCollapsedDateDialog = !this.isCollapsedDateDialog;
    }
  }

  handleSelectVegIndexOptionClick(index: IVegIndexOption) {
    this.selectedVegOption = index;
    this.selectedDate = null;
    this.removeImageOverlay();
    this.isCollapsedIndexDialog = false;
    this.vegIndexOptionClick.emit(this.selectedVegOption);
  }

  handleSelectDate(date: string | null) {
    if (date) {
      this.selectedDate = date;
      this.isCollapsedDateDialog = false;
      this.removeImageOverlay();
      this.setImageOverlay(date);
      this.onDateSelect.emit();
    }
    if (date === null) {
      this.removeImageOverlay();
    }
  }

  handleCalendarDateClick(date: string | null) {
    if (date) {
      this.selectedDate = date;
      this.isCollapsedDateDialog = false;
      this.removeImageOverlay();
      this.setImageOverlay(date);
    }
  }

  private setImageOverlay(date: string) {
    if (this.mapData?.map && this.bounds) {
      this.imageOverlayIncstance = this.mapServie.setImageOverlay(
        this.mapData.map,
        this.buildImageUrl(date),
        this.bounds,
        { zIndex: 2000, interactive: false }
      );
    }
  }

  private buildImageUrl(date: string): string {
    const imageUrl = this.vegIndexesData.filter(
      (vegIndex) => vegIndex.date === date
    )[0].index_image;
    return `${environment.apiUrl}${imageUrl}`;
  }

  private removeImageOverlay() {
    if (this.imageOverlayIncstance && this.mapData?.map) {
      this.mapData.map.removeLayer(this.imageOverlayIncstance);
      this.imageOverlayIncstance = null;
    }
  }

  ngDoCheck(): void {
    const vegIndexesDataChanges = this.vegIndexesDataDiffer.diff(
      this.vegIndexesData as any
    );

    if (vegIndexesDataChanges) {
      this.activeDates = this.vegIndexesData.map((index) => index.date);
    }
  }

  ngOnInit(): void {
    this.selectedVegOption = this.vegIndexOptionsList[0];
  }

  ngOnDestroy(): void {
    if (this.imageOverlayIncstance)
      this.mapData?.map.removeLayer(this.imageOverlayIncstance);
  }
}
