import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { LanguageService } from 'src/modules/ui/services/language.service';
import { MapControlComponent } from '../map-control/map-control.component';

@Component({
  selector: 'app-map-control-statistics',
  templateUrl: './map-control-statistics.component.html',
  styleUrls: ['./map-control-statistics.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SvgIconComponent,
    MapControlComponent,
  ],
})
export class MapControlStatisticsComponent {
  @Input() isCollapsed: boolean = true;
  @Input() title = '';
  @Output() onToggle = new EventEmitter<boolean>();

  constructor(translate: LanguageService) {}

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    this.onToggle.next(this.isCollapsed);
  }
}
