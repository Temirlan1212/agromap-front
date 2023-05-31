import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  Input,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.scss'],
  standalone: true,
  host: { class: 'map-control' },
  imports: [SvgIconComponent, TooltipComponent],
})
export class MapControlComponent {
  @Input() iconName: string = '';
  @Input() tooltipTitle: string = '';
  @Output() onClick = new EventEmitter<boolean>();

  @HostBinding('class.active')
  public isSelected = false;

  @HostListener('click', ['$event'])
  public click() {
    this.isSelected = !this.isSelected;
    this.onClick.emit(this.isSelected);
  }
}
