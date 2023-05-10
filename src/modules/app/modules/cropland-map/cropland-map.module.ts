import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CroplandMapRoutingModule } from './cropland-map-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CroplandMapComponent } from './cropland-map.component';
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
import { MapService } from '../../../ui/services/map.service';
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
import { UnitPipe } from 'src/modules/ui/pipes/unit.pipe';
import { CheckExistPipe } from 'src/modules/ui/pipes/check-exist.pipe';
import { InputRadioComponent } from '../../../ui/components/input-radio/input-radio.component';
import { MapControlStatisticsComponent } from 'src/modules/ui/components/map-control-statistics/map-control-statistics.component';
import { TableComponent } from 'src/modules/ui/components/table/table.component';
import { TruncatePipe } from 'src/modules/ui/pipes/truncate.pipe';
import { InputCheckboxComponent } from 'src/modules/ui/components/input-checkbox/input-checkbox.component';
import { FormFieldComponent } from '../../../ui/components/form-field/form-field.component';
import { ContentTabsComponent } from '../../../ui/components/content-tabs/content-tabs.component';
import { TabComponent } from '../../../ui/components/content-tabs/tab/tab.component';
import { ContourInfoComponent } from './components/contour-info/contour-info.component';
import { ContourDetailsComponent } from './components/contour-details/contour-details.component';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';

@NgModule({
  declarations: [
    CroplandMapComponent,
    ContourFilterComponent,
    ContourAddComponent,
    SplineAreaChartComponent,
    ContourFormComponent,
    SplitMapSidebarComponent,
    ContourEditComponent,
    ContourInfoComponent,
    ContourDetailsComponent,
  ],
  imports: [
    CommonModule,
    CroplandMapRoutingModule,
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
    UnitPipe,
    CheckExistPipe,
    InputRadioComponent,
    MapControlStatisticsComponent,
    TableComponent,
    TruncatePipe,
    InputCheckboxComponent,
    FormFieldComponent,
    ContentTabsComponent,
    TabComponent,
    ToggleButtonComponent,
  ],
  providers: [MapService, TranslatePipe],
})
export class CroplandMapModule {}
