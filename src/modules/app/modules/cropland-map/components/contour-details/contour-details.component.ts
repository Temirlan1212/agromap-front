import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MapData } from '../../../../../ui/models/map.model';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  ActiveLayerAttributes,
  ActiveLayerAttributesType,
} from '../../lib/attributes/active-layer-attributes';
@Component({
  selector: 'app-contour-details',
  templateUrl: './contour-details.component.html',
  styleUrls: ['./contour-details.component.scss'],
})
export class ContourDetailsComponent implements OnChanges, OnInit, OnDestroy {
  @Input() mapData!: MapData | null;
  @Input() activeContour: any;
  @Output() onCancelClick = new EventEmitter<void>();
  isHidden: boolean = false;
  hasOverlay: boolean = false;
  overlayPane: any;
  rgbaOverlay: any;
  currentLang: string = this.translateSvc.currentLang;
  sub: Subscription = this.translateSvc.onLangChange.subscribe((res) => {
    this.currentLang = res.lang;
    this.getActiveLayerAttributes();
  });
  activeLayerAttributes: ActiveLayerAttributesType[] = [];

  constructor(
    private translateSvc: TranslateService,
    private _activeLayerAttributes: ActiveLayerAttributes
  ) {}

  getActiveLayerAttributes = () => {
    if (this.activeContour) {
      this.activeLayerAttributes = this._activeLayerAttributes.attributes(
        this.activeContour
      );
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeContour']) {
      this.getActiveLayerAttributes();
    }
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.rgbaOverlay?.remove();
    if (this.overlayPane) {
      this.mapData?.map?.removeLayer(this.overlayPane);
    }
    this.hasOverlay = false;
    this.sub.unsubscribe();
  }
}
