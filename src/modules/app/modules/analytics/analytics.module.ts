import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { MapComponent } from 'src/modules/ui/components/map/map.component';
import { FilterComponent } from './components/filter/filter.component';
import { AnalyticsComponent } from './analytics.component';
import { InputComponent } from '../../../ui/components/input/input.component';


@NgModule({
  declarations: [
    FilterComponent,
    AnalyticsComponent,
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    MapComponent,
    InputComponent,
  ]
})
export class AnalyticsModule { }
