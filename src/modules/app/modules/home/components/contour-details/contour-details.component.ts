import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
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
export class ContourDetailsComponent implements OnDestroy {
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

  createOverlay() {
    if (!this.hasOverlay) {
      const tileUrl = 'assets/images/dark_overlay.png';

      this.overlayPane = this.mapData?.map?.createPane('overlayPane');
      this.overlayPane!.style.zIndex = '200';

      this.rgbaOverlay = tileLayer(tileUrl, {
        opacity: 0.7,
        attribution: 'Overlay © OpenStreetMap contributors',
      });

      this.rgbaOverlay.addTo(this.mapData?.map);
      this.mapData?.map
        ?.getPane('overlayPane')!
        .appendChild(this.rgbaOverlay.getContainer() as any);
      this.hasOverlay = true;
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
