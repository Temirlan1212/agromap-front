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
import { LandTypeFormComponent } from './components/report-form/report-form.component';
import { PastureProductivityStatsComponent } from './components/pasture-productivity-stats/pasture-productivity-stats.component';
import { LoadingComponent } from 'src/modules/ui/components/loading/loading.component';
import { CultureStatsComponent } from './components/culture-stats/culture-stats.component';
import { TableComponent } from 'src/modules/ui/components/table/table.component';
import { InputRadioComponent } from 'src/modules/ui/components/input-radio/input-radio.component';

@NgModule({
  declarations: [
    ReportsComponent,
    SimplePieChartComponent,
    LandTypeFormComponent,
    PastureProductivityStatsComponent,
    CultureStatsComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    InputSelectComponent,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    NgApexchartsModule,
    LoadingComponent,
    TableComponent,
    InputRadioComponent,
  ],
  providers: [TranslatePipe],
})
export class ReportsModule {}
