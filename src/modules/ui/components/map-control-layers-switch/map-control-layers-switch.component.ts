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
  ],
})
export class MapControlLayersSwitchComponent {
  @Input() map!: Map;
  @Input() baseLayers: ITileLayer[] = [];
  @Input() wmsLayers: ITileLayer[] = [];
  @Input() activeBaseLayer: ITileLayer | null = null;
  @Input() activeWmsLayer: ITileLayer | null = null;
  @Output() wmsLayerChanged = new EventEmitter<ITileLayer | null>();
  @Output() baseLayerChanged = new EventEmitter<ITileLayer | null>();

  isCollapsed = false;

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService
  ) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickInside = this.elementRef.nativeElement.contains(target);
    if (!clickInside) this.isCollapsed = false;
  }

  handleCollapseClick(e: Event) {
    this.isCollapsed = !this.isCollapsed;
  }

  handleWmsLayerChange(layerName: string | number): void {
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
}
