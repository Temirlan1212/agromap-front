import {
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { LandTypeFormComponent } from '../report-form/report-form.component';
import { MessagesService } from 'src/modules/ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pasture-productivity-stats',
  templateUrl: './pasture-productivity-stats.component.html',
  styleUrls: ['./pasture-productivity-stats.component.scss'],
})
export class PastureProductivityStatsComponent implements AfterViewInit {
  @ViewChild('form') form!: LandTypeFormComponent;
  series: number[] = [];
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private cd: ChangeDetectorRef
  ) {}

  async handleButtonClick() {
    const formState = this.form.getState();
    const { value } = formState;

    const land_type = this.form.form.get('land_type');
    const region = this.form.form.get('region');

    land_type?.disable();
    land_type?.setValue(2);
    region?.setValue(value.region || 3);

    const params = {
      ...value,
      land_type: 2,
      region: value.region || 3,
    };

    if (!params.region) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }

    this.series = [];
    this.loading = true;
    try {
      const res = await this.api.statistics.getPastureStatisticsProductivity(
        params
      );
      if (res.Productive?.ha && res.Unproductive?.ha) {
        this.series = [...this.series, res.Productive.ha, res.Unproductive.ha];
      }
    } catch (error: any) {
      this.messages.error(this.translate.transform(error.message));
    }
    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.handleButtonClick();
    this.cd.detectChanges();
  }
}
