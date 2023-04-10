import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { PastureFormComponent } from '../pasture-form/pasture-form.component';
import { MessagesService } from 'src/modules/ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pasture-productivity-stats',
  templateUrl: './pasture-productivity-stats.component.html',
  styleUrls: ['./pasture-productivity-stats.component.scss'],
})
export class PastureProductivityStatsComponent implements OnInit {
  ngOnInit(): void {}

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {}

  async handleApplyClick(form: PastureFormComponent) {
    const formState = form.getState();
    const { value } = formState;

    if (!value.region) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    const res = await this.api.statistics.getContourStatisticsProductivity(
      value
    );
    console.log(res);
  }
}
