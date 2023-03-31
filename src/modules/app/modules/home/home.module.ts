import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { MapComponent } from 'src/modules/ui/components/map/map.component';
import { SidePanelComponent } from 'src/modules/ui/components/side-panel/side-panel.component';
import { ContourFilterComponent } from './components/contour-filter/contour-filter.component';
import { InputSelectComponent } from 'src/modules/ui/components/input-select/input-select.component';
import { SvgIconComponent } from 'src/modules/ui/components/svg-icon/svg-icon.component';
import { ContourAddComponent } from './components/contour-add/contour-add.component';
import { FieldsGroupComponent } from 'src/modules/ui/components/fields-group/fields-group.component';
import { SplineAreaChartComponent } from './components/spline-area-chart/spline-area-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ContourFormComponent } from './components/contour-form/contour-form.component';
import { InputComponent } from '../../../ui/components/input/input.component';
import { MapService } from './map.service';
import { CardAccordionComponent } from '../../../ui/components/card-accordion/card-accordion.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { DatePickerComponent } from 'src/modules/ui/components/date-picker/date-picker.component';
import { MapControlsComponent } from 'src/modules/ui/components/map-controls/map-controls.component';
import { MapControlLocateComponent } from 'src/modules/ui/components/map-control-locate/map-control-locate.component';
import { MapControlZoomComponent } from 'src/modules/ui/components/map-control-zoom/map-control-zoom.component';
import { MapControlLayersSwitchComponent } from 'src/modules/ui/components/map-control-layers-switch/map-control-layers-switch.component';
import { MapControlVegIndexesComponent } from 'src/modules/ui/components/map-control-veg-indexes/map-control-veg-indexes.component';
import { ContourEditComponent } from './components/contour-edit/contour-edit.component';
import { QuestionDialogComponent } from '../../../ui/components/question-dialog/question-dialog.component';
import { MapControlSplitMapComponent } from 'src/modules/ui/components/map-control-split-map/map-control-split-map.component';
import { SplitMapSidebarComponent } from './components/split-map-sidebar/split-map-sidebar.component';
import { SplitMapComponent } from 'src/modules/ui/components/split-map/split-map.component';
import { LoadingComponent } from 'src/modules/ui/components/loading/loading.component';

@NgModule({
  declarations: [
    HomeComponent,
    ContourFilterComponent,
    ContourAddComponent,
    SplineAreaChartComponent,
    ContourFormComponent,
    SplitMapSidebarComponent,
    ContourEditComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MapComponent,
    SidePanelComponent,
    InputSelectComponent,
    SvgIconComponent,
    FieldsGroupComponent,
    NgApexchartsModule,
    InputComponent,
    CardAccordionComponent,
    LoadingComponent,
    TranslateModule,
    MapControlVegIndexesComponent,
    DatePickerComponent,
    MapControlsComponent,
    MapControlLocateComponent,
    MapControlZoomComponent,
    MapControlLayersSwitchComponent,
    QuestionDialogComponent,
    MapControlSplitMapComponent,
    SplitMapComponent,
    LoadingComponent,
  ],
  providers: [MapService, TranslatePipe],
})
export class HomeModule {}
