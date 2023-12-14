import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  Input,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.scss'],
  standalone: true,
  host: { class: 'map-control' },
  imports: [SvgIconComponent, TooltipComponent, CommonModule, TranslateModule],
})
export class MapControlComponent {
  @Input() iconName: string = '';
  @Input() width: string = '';
  @Input() tooltipTitle: string = '';
  @Input() tooltipPlacement: 'top' | 'right' | 'bottom' | 'left' = 'left';
  @Input() tooltipClass = '';
  @Output() onClick = new EventEmitter<boolean>();

  public isSelected = false;

  @HostListener('click', ['$event'])
  public click() {
    this.onClick.emit((this.isSelected = !this.isSelected));
  }
}
