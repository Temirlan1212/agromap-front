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
import { FormGroup } from '@angular/forms';

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
    land_type?.setValue(2);
    land_type?.disable();

    if (!value.region) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }

    this.series = [];
    this.loading = true;
    try {
      const res = await this.api.statistics.getContourStatisticsProductivity({
        ...value,
        land_type: 2,
      });
      this.series = [...this.series, res.Productive.ha, res.Unproductive.ha];
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
