import { Component, Input, OnDestroy } from '@angular/core';
import { ApiService } from '../../../../../api/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CroplandMainLayerService } from '../../lib/services/layer.service';

@Component({
  selector: 'app-contour-info',
  templateUrl: './contour-info.component.html',
  styleUrls: ['./contour-info.component.scss'],
})
export class ContourInfoComponent implements OnDestroy {
  @Input() isWmsAiActive!: boolean;
  loading: boolean = false;
  activeContour!: any;
  currentLang: string = this.translateSvc.currentLang;
  hidden: boolean = false;
  subs: Subscription[] = [];

  constructor(
    private api: ApiService,
    private translateSvc: TranslateService,
    private layerService: CroplandMainLayerService
  ) {
    const sub1 = this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    );
    const sub2 = this.layerService.selectProperties.subscribe(async (v) => {
      if (!!v['id']) {
        // await this.getContour(v.id);
        // this.hidden = !v.id;
      }
    });
    this.subs.push(...[sub1, sub2]);
  }

  async getContour(contourId: number): Promise<void> {
    this.loading = true;
    try {
      if (this.isWmsAiActive) {
        this.activeContour = await this.api.aiContour.getOne(contourId);
      } else {
        this.activeContour = await this.api.contour.getOne(contourId);
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.loading = false;
    }
  }

  handleCancelClick() {}

  ngOnDestroy() {
    this.subs.map((sub) => sub.unsubscribe());
  }
}
