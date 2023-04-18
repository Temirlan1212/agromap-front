import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IContour } from '../../../../../api/models/contour.model';
import { ApiService } from '../../../../../api/api.service';
import { IDistrict } from '../../../../../api/models/district.model';
import { IConton } from '../../../../../api/models/conton.model';
import { IRegion } from '../../../../../api/models/region.model';
import { ILandType } from '../../../../../api/models/land-type.model';
import { ICulture } from '../../../../../api/models/culture.model';

@Component({
  selector: 'app-contour-info',
  templateUrl: './contour-info.component.html',
  styleUrls: ['./contour-info.component.scss'],
})
export class ContourInfoComponent implements OnChanges {
  @Input() contourId!: number;
  @Input() isWmsAiActive!: boolean;
  loading: boolean = false;
  contour!: IContour;

  constructor(private api: ApiService) {}

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
}
