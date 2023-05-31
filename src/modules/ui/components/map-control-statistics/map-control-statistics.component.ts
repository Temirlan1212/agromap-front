import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class MapControlStatisticsComponent implements OnChanges {
  isCollapsed: boolean = true;

  @Input() title = '';
  @Input() collapseOnChanges: any;

  constructor(translate: LanguageService) {}

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collapseOnChanges']) {
      this.isCollapsed = true;
    }
  }
}
