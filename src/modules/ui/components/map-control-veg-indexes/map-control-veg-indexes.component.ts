import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { ApiService } from 'src/modules/api/api.service';
import {
  IDate,
  IVegIndexList,
  IVegSatelliteDate,
} from 'src/modules/api/models/veg-indexes.model';
import { MapControlTabSlider } from '../map-control-tab-slider/map-control-tab-slider.component';
import { MapData, MapLayerFeature } from '../../models/map.model';
import * as L from 'leaflet';
import { environment } from 'src/environments/environment';
import { Feature } from 'geojson';

@Component({
  selector: 'app-map-control-veg-indexes',
  templateUrl: './map-control-veg-indexes.component.html',
  styleUrls: ['./map-control-veg-indexes.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    DatePickerComponent,
    MapControlTabSlider,
  ],
})
export class MapControlVegIndexes
  implements AfterViewInit, DoCheck, AfterContentChecked
{
  private differ: KeyValueDiffer<string, IVegSatelliteDate>;

  @ViewChild('vegIndexesDialog')
  vegIndexesDialogEl!: ElementRef<HTMLInputElement>;

  @ViewChild('dateDialog')
  dateDialogEl!: ElementRef<HTMLInputElement>;

  @ViewChild('timeline')
  timelineEl!: ElementRef<HTMLInputElement>;

  @Input() mapData: MapData | null = null;
  @Output() imageOverlayIncstanceOutput = new EventEmitter<L.ImageOverlay>();

  isLayerChanged = false;

  @Input('layer') set layer(value: MapLayerFeature | null) {
    if (value?.feature.properties?.['id']) {
      this.layerFeatureContourId = value?.feature.properties?.['id'].toString();
      this.layerFeature = value.feature;
      this.isLayerChanged = !this.isLayerChanged;

      this.getVegSatelliteDates();
      this.removeImageOverlay();
    }
  }

  layerFeatureContourId: string = '';
  layerFeature: Feature | null = null;

  selectedDate: IDate | null = null;
  selectedIndex: IVegIndexList = {
    id: 1,
    name_ru: 'NDVI',
    name_en: '',
    name_ky: '',
    description_en: '',
    description_ky: '',
    description_ru: '',
  };

  imageOverlayIncstance: L.ImageOverlay | null = null;

  activeDates: IDate[] = [];

  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexList[] = [];

  isCollapsedIndexDialog = false;
  isCollapsedDateDialog = false;

  months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  constructor(
    private api: ApiService,
    private differs: KeyValueDiffers,
    private ref: ChangeDetectorRef
  ) {
    this.differ = this.differs.find(this.vegIndexesData).create();
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

  async handleSelectIndexClick(index: IVegIndexList) {
    this.selectedIndex = index;
    this.selectedDate = null;
    this.removeImageOverlay();
    this.isCollapsedIndexDialog = false;
    await this.getVegSatelliteDates();
  }

  handleSelectDate(date: IDate | null) {
    if (date?.date) {
      this.selectedDate = date;
      this.isCollapsedDateDialog = false;
      this.setImageOverlay(date.date.split('|')[0]);
    }
  }

  handleColendarDateClick(date: IDate | null) {
    if (date?.date) {
      this.selectedDate = date;
      this.isCollapsedDateDialog = false;
      this.setImageOverlay(date.date.split('|')[0]);
    }
  }

  async getVegSatelliteDates(): Promise<void> {
    try {
      this.vegIndexesData = (await this.api.vegIndexes.getVegSatelliteDates({
        vegIndexId: this.selectedIndex.id.toString(),
        contourId: this.layerFeatureContourId,
      })) as IVegSatelliteDate[];
    } catch (e: any) {
      console.log(e);
    }
  }

  async getVegIndexList() {
    try {
      this.vegIndexOptionsList =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexList[];
    } catch (e: any) {
      console.log(e);
    }
  }

  setImageOverlay(date: string) {
    const imageUrl = this.vegIndexesData.filter(
      (vegIndex) => vegIndex.date === date
    )[0].index_image;
    let imageFullUrl = `${environment.apiUrl}${imageUrl}`;

    this.removeImageOverlay();

    if (this.layerFeature && this.mapData?.map) {
      this.imageOverlayIncstance = L.imageOverlay(
        imageFullUrl,
        L.geoJSON(this.layerFeature).getBounds(),
        { opacity: 1, interactive: true }
      );

      this.imageOverlayIncstanceOutput.emit(this.imageOverlayIncstance);
      this.mapData.map.addLayer(this.imageOverlayIncstance);
    }
  }

  removeImageOverlay() {
    if (this.imageOverlayIncstance && this.mapData?.map) {
      this.mapData.map.removeLayer(this.imageOverlayIncstance);
      this.imageOverlayIncstance = null;
    }
  }

  async ngAfterViewInit() {
    await this.getVegIndexList();
  }

  async ngDoCheck(): Promise<void> {
    const changes = this.differ.diff(this.vegIndexesData as any);
    if (changes) {
      this.activeDates = this.vegIndexesData.map((index) => {
        return {
          formattedDate: `${index.date.split('-')[0]} ${
            this.months[+index.date.split('-')[1] - 1]
          } ${index.date.split('-')[2]}`,
          date: index.date + '|' + index.id,
        };
      });
    }
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
}
