import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { ApiService } from '../../../../../api/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contour-info',
  templateUrl: './contour-info.component.html',
  styleUrls: ['./contour-info.component.scss'],
})
export class ContourInfoComponent implements OnChanges, OnDestroy {
  @Input() contourId!: number;
  @Input() isWmsAiActive!: boolean;
  loading: boolean = false;
  contour!: any;
  currentLang: string = this.translateSvc.currentLang;
  sub: Subscription = this.translateSvc.onLangChange.subscribe(
    (res) => (this.currentLang = res.lang)
  );

  constructor(
    private api: ApiService,
    private translateSvc: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contourId']) {
      this.getContour();
    }
  }

  async getContour(): Promise<void> {
    this.loading = true;
    try {
      if (this.isWmsAiActive) {
        this.contour = await this.api.aiContour.getOne(this.contourId);
      } else {
        this.contour = await this.api.contour.getOne(this.contourId);
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
