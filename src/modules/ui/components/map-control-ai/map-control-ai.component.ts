import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TileLayer, Map } from 'leaflet';

@Component({
  selector: 'app-map-control-ai',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './map-control-ai.component.html',
  styleUrls: ['./map-control-ai.component.scss'],
})
export class MapControlAiComponent implements OnChanges {
  @Input() map: Map | null = null;
  @Input() wms: TileLayer | null = null;
  @Output() clicked = new EventEmitter<boolean>();

  isActive: boolean = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wms'] != null && this.map != null) {
      if (this.isActive && changes['wms'].currentValue != null) {
        this.map.addLayer(changes['wms'].currentValue);
      } else if (!this.isActive && changes['wms'].previousValue != null) {
        this.map.removeLayer(changes['wms'].previousValue);
      }
    }
  }

  handleClick(): void {
    this.isActive = !this.isActive;
    this.clicked.emit(this.isActive);
  }
}
