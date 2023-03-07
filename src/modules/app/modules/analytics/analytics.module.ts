import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { MapComponent } from 'src/modules/ui/components/map/map.component';
import { FilterComponent } from './components/filter/filter.component';
import { AnalyticsComponent } from './analytics.component';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';
import { InputSelectComponent } from '../../../ui/components/input-select/input-select.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FilterComponent,
    AnalyticsComponent,
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    MapComponent,
    SidePanelComponent,
    InputSelectComponent,
    ReactiveFormsModule,
  ]
})
export class AnalyticsModule { }
