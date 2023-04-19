import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { StoreService } from 'src/modules/api/store.service';
import { LanguageService } from 'src/modules/api/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-control-statistics',
  templateUrl: './map-control-statistics.component.html',
  styleUrls: ['./map-control-statistics.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, SvgIconComponent],
})
export class MapControlStatisticsComponent implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  subscription: Subscription = this.store
    .watchItem('isCollapsedMapControlTable')
    .subscribe((v) => {
      this.isCollapsed = v;
    });

  @Input() title = '';

  constructor(private store: StoreService, translate: LanguageService) {}

  toggle() {
    this.store.setItem('isCollapsedMapControlTable', !this.isCollapsed);
  }

  ngOnInit(): void {
    this.isCollapsed =
      this.store.getItem('isCollapsedMapControlTable') || false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
