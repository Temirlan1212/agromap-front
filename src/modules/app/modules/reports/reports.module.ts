import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { InputSelectComponent } from '../../../ui/components/input-select/input-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LandTypeStatsComponent } from './land-type-stats/land-type-stats.component';
import { InputComponent } from '../../../ui/components/input/input.component';
import { SplineAreaChartComponent } from './components/spline-area-chart/spline-area-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [
    ReportsComponent,
    LandTypeStatsComponent,
    SplineAreaChartComponent,
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
})
export class ReportsModule {}
