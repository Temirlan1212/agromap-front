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
  @Input() wmsLayersOverlay: ITileLayer[] = [];
  @Input() activeBaseLayer: ITileLayer | null = null;
  @Input() activeWmsLayer: ITileLayer | null = null;
  @Output() wmsLayerChanged = new EventEmitter<ITileLayer | null>();
  @Output() baseLayerChanged = new EventEmitter<ITileLayer | null>();
  @Output() wmsLayersOverlayChanged = new EventEmitter<ITileLayer | null>();

  selected!: string;
  isCollapsed = false;

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService,
    private store: StoreService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['mode'].firstChange) {
      if (changes['mode'].currentValue == 'agromap_store_ai') {
        this.selected = 'agromap_store_ai';
        this.handleWmsLayerChange('agromap_store_ai');
      } else {
        this.selected = 'agromap_store';
        this.handleWmsLayerChange('agromap_store');
      }
    } else {
      this.selected = this.store.getItem(
        'ContourFilterComponentMode'
      ) as string;

      const wmsLayersOverlayState = this.store.getItem('WmsLayersOverlay');
      if (wmsLayersOverlayState) {
        this.wmsLayersOverlay = this.wmsLayersOverlay.map((l, index) => {
          if (wmsLayersOverlayState[index].checked) this.map.addLayer(l.layer);
          return Object.assign({}, l, wmsLayersOverlayState[index]);
        });
      }

      this.handleWmsLayerChange(this.selected);
    }
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

  handleWmsLayerChange(layerName: string | number): void {
    if (!!layerName) {
      this.store.setItem('ContourFilterComponentMode', layerName);
    }
    if (this.activeWmsLayer != null) {
      this.map.removeLayer(this.activeWmsLayer.layer);
      this.activeWmsLayer = null;
    }

    const current = this.wmsLayers.find((l) => l.name === layerName);
    if (current != null) {
      this.activeWmsLayer = current;
      this.map.addLayer(this.activeWmsLayer.layer);
    }

    this.wmsLayerChanged.emit(this.activeWmsLayer);
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

  handleWmsLayersOverlayChange(layerName: string | number): void {
    const wmsLayer = this.wmsLayersOverlay.find((l) => l.name === layerName);

    if (wmsLayer) {
      wmsLayer.checked = !wmsLayer.checked;
      wmsLayer.checked
        ? this.map.addLayer(wmsLayer.layer)
        : this.map.removeLayer(wmsLayer.layer);
    }

    const wmsLayersOverlayState = this.wmsLayersOverlay.map(
      ({ name, checked }) => ({
        name,
        checked: name === layerName ? wmsLayer?.checked : checked,
      })
    );

    this.store.setItem('WmsLayersOverlay', wmsLayersOverlayState);
    this.wmsLayersOverlayChanged.emit(wmsLayer);
  }
}
