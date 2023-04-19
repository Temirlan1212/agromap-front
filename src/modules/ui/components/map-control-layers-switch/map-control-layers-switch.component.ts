import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { Map } from 'leaflet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ITileLayer } from '../../models/map.model';
import { InputRadioComponent } from '../input-radio/input-radio.component';
import { StoreService } from '../../../api/store.service';
import { InputCheckboxComponent } from '../input-checkbox/input-checkbox.component';

interface ISelectedItem {
  name: string;
  opacity?: number;
}

@Component({
  selector: 'app-map-control-layers-switch',
  standalone: true,
  templateUrl: './map-control-layers-switch.component.html',
  styleUrls: ['./map-control-layers-switch.component.scss'],
  imports: [
    CommonModule,
    SvgIconComponent,
    TranslateModule,
    InputRadioComponent,
    InputCheckboxComponent,
  ],
})
export class MapControlLayersSwitchComponentComponent implements OnChanges {
  @Input() map!: Map;
  @Input() mode!: string;
  @Input() baseLayers: ITileLayer[] = [];
  @Input() wmsLayers: ITileLayer[] = [];
  @Input() activeBaseLayer: ITileLayer | null = null;
  @Input() activeWmsLayers: ITileLayer[] = [];
  @Input() wmsSelectedStatusLayers: Record<string, string> | null = null;
  @Output() wmsLayerChanged = new EventEmitter<ITileLayer | null>();
  @Output() baseLayerChanged = new EventEmitter<ITileLayer | null>();

  wmsBaseLayers: ITileLayer[] = [];
  wmsOverLayers: ITileLayer[] = [];

  selected: Record<string, ISelectedItem> = {};
  isCollapsed = false;

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService,
    private store: StoreService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const value = changes['mode'].currentValue;
    console.log(value);

    if (this.wmsSelectedStatusLayers) {
      const filterControlLayerSwitchStatus: any =
        this.wmsSelectedStatusLayers['filterControlLayerSwitch'];

      if (filterControlLayerSwitchStatus instanceof Object) {
        this.selected['filterControlLayerSwitch'] = {
          name: filterControlLayerSwitchStatus.name,
        };
        this.handleWmsRadioButtonLayerChange(
          filterControlLayerSwitchStatus.name
        );
      }
    }

    for (let key in this.wmsSelectedStatusLayers) {
      this.handleWmsCheckboxLayerChange(
        !!this.wmsSelectedStatusLayers[key],
        key
      );
    }

    if (value) {
      this.selected['filterControlLayerSwitch'] = value;
      this.handleWmsRadioButtonLayerChange(value);
    }
    this.wmsBaseLayers = this.wmsLayers.filter((l) => l.type === 'radio');
    this.wmsOverLayers = this.wmsLayers.filter((l) => l.type === 'checkbox');
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickInside = this.elementRef.nativeElement.contains(target);
    if (!clickInside) {
      this.isCollapsed = false;
    }
  }

  handleCollapseClick(e: Event) {
    this.isCollapsed = !this.isCollapsed;
  }

  handleWmsRadioButtonLayerChange(layerName: string | number): void {
    this.wmsLayers.map((l) => {
      if (l.type === 'radio') this.map.removeLayer(l.layer);
      const isCurrent = layerName === l.name;
      if (isCurrent) {
        this.map.addLayer(l?.layer);
        this.wmsLayerChanged.emit(l);
      }
    });

    const data = this.store.getItem('MapControlLayersSwitchComponent');
    let obj = {} as ISelectedItem;
    obj.name = String(layerName);

    this.store.setItem('MapControlLayersSwitchComponent', {
      ...data,
      filterControlLayerSwitch: Object.assign(
        {},
        data['filterControlLayerSwitch'],
        obj
      ),
    });
  }

  handleWmsCheckboxLayerChange(checked: boolean, id: string): void {
    this.wmsLayers.forEach((l) => {
      const isCurrent = id === l.name;
      if (isCurrent) {
        this.selected = { ...this.selected, [id]: { name: checked ? id : '' } };
        if (checked) {
          this.map.addLayer(l.layer);
        } else {
          this.map.removeLayer(l.layer);
        }

        const data = this.store.getItem('MapControlLayersSwitchComponent');

        this.store.setItem(
          'MapControlLayersSwitchComponent',
          Object.assign({}, data, this.selected)
        );
      }
    });
  }

  handleBaseLayerChange(layerName: string | number): void {
    if (this.activeBaseLayer != null) {
      this.map.removeLayer(this.activeBaseLayer.layer);
      this.activeBaseLayer = null;
    }

    const current = this.baseLayers.find((l) => l.name === layerName);
    if (current != null) {
      this.activeBaseLayer = current;
      this.map.addLayer(this.activeBaseLayer.layer);
    }

    this.baseLayerChanged.emit(this.activeBaseLayer);
  }
}
