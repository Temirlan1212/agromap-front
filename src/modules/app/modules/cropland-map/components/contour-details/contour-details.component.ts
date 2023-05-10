import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MapData } from '../../../../../ui/models/map.model';
import { tileLayer } from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contour-details',
  templateUrl: './contour-details.component.html',
  styleUrls: ['./contour-details.component.scss'],
})
export class ContourDetailsComponent implements OnDestroy, OnChanges {
  @Input() mapData!: MapData | null;
  @Input() activeContour: any;
  @Input() activeContourSmall: any;
  @Output() onCancelClick = new EventEmitter<void>();
  isHidden: boolean = false;
  hasOverlay: boolean = false;
  overlayPane: any;
  rgbaOverlay: any;
  currentLang: string = this.translateSvc.currentLang;
  sub: Subscription = this.translateSvc.onLangChange.subscribe(
    (res) => (this.currentLang = res.lang)
  );

  constructor(private translateSvc: TranslateService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeContour']) {
      console.log(changes);
    }
  }

  ngOnDestroy() {
    this.rgbaOverlay?.remove();
    if (this.overlayPane) {
      this.mapData?.map?.removeLayer(this.overlayPane);
    }
    this.hasOverlay = false;
    this.sub.unsubscribe();
  }
}