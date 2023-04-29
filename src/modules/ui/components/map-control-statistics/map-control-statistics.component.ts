import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { StoreService } from 'src/modules/ui/services/store.service';
import { LanguageService } from 'src/modules/ui/services/language.service';
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

  @Input() storageName: string = 'isCollapsedMapControlTable';
  @Input() title = '';

  subscription: Subscription = this.store
    .watchItem(this.storageName)
    .subscribe((v) => {
      this.isCollapsed = v;
    });

  constructor(private store: StoreService, translate: LanguageService) {}

  toggle() {
    this.store.setItem(this.storageName, !this.isCollapsed);
  }

  ngOnInit(): void {
    this.isCollapsed = this.store.getItem(this.storageName) || false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
