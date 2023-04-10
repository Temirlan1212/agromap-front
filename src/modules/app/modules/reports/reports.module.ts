import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { InputSelectComponent } from '../../../ui/components/input-select/input-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { InputComponent } from '../../../ui/components/input/input.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SimplePieChartComponent } from './components/simple-pie-chart/simple-pie-chart.component';
import { PastureFormComponent } from './components/pasture-form/pasture-form.component';
import { PastureProductivityStatsComponent } from './components/pasture-productivity-stats/pasture-productivity-stats.component';

@NgModule({
  declarations: [
    ReportsComponent,
    SimplePieChartComponent,
    PastureFormComponent,
    PastureProductivityStatsComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    InputSelectComponent,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    NgApexchartsModule,
  ],
  providers: [TranslatePipe],
})
export class ReportsModule {}
