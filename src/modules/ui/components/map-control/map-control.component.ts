import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  Input,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.scss'],
  standalone: true,
  host: { class: 'tab' },
  imports: [SvgIconComponent],
})
export class MapControlComponent {
  @Input() iconName: string = '';
  @Output() onClick = new EventEmitter<boolean>();

  @HostBinding('class.active')
  public isSelected = false;

  @HostListener('click', ['$event'])
  public click() {
    this.isSelected = !this.isSelected;
    this.onClick.emit(this.isSelected);
  }
}
