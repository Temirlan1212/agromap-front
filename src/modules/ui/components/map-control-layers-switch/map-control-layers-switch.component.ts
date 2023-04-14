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
export class MapControlLayersSwitchComponent implements OnChanges {
  @Input() map!: Map;
  @Input() mode!: string;
  @Input() baseLayers: ITileLayer[] = [];
  @Input() wmsLayers: ITileLayer[] = [];
  @Input() activeBaseLayer: ITileLayer | null = null;
  @Input() activeWmsLayers: ITileLayer[] | null[] = [];
  @Output() wmsLayerChanged = new EventEmitter<ITileLayer | null>();
  @Output() baseLayerChanged = new EventEmitter<ITileLayer | null>();

  wmsBaseLayers: ITileLayer[] = [];
  wmsOverLayers: ITileLayer[] = [];

  selected: Record<string, string> = {};
  isCollapsed = false;

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService,
    private store: StoreService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mode'].firstChange) {
      if (changes['mode'].currentValue == 'agromap_store_ai') {
        this.selected['filterControlLayerSwitch'] = 'agromap_store_ai';
        this.handleWmsRadioButtonLayerChange('agromap_store_ai');
      } else {
        this.selected['filterControlLayerSwitch'] = 'agromap_store';
        this.handleWmsRadioButtonLayerChange('agromap_store');
      }
    } else {
      const wmsLayersState = this.store.getItem('mapControlLayersSwitch');
      if (wmsLayersState) {
        this.selected['filterControlLayerSwitch'] =
          wmsLayersState['filterControlLayerSwitch'];
      }
      this.handleWmsRadioButtonLayerChange(
        this.selected['filterControlLayerSwitch']
      );

      for (let key in wmsLayersState) {
        this.handleWmsCheckboxLayerChange({
          checked: wmsLayersState[key],
          name: key,
        });
      }
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

    const data = this.store.getItem('mapControlLayersSwitch');
    this.store.setItem('mapControlLayersSwitch', {
      ...data,
      filterControlLayerSwitch: layerName,
    });
  }

  handleWmsCheckboxLayerChange({
    name,
    checked,
  }: Record<string, string>): void {
    this.wmsLayers.forEach((l) => {
      const isCurrent = name === l.name;
      if (isCurrent) {
        this.selected = { ...this.selected, [name]: checked };

        if (checked) {
          this.map.addLayer(l.layer);
        } else {
          this.map.removeLayer(l.layer);
        }

        const data = this.store.getItem('mapControlLayersSwitch');
        this.store.setItem(
          'mapControlLayersSwitch',
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
