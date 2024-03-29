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
import { SplitMapSidebarComponent } from './components/split-map-sidebar/split-map-sidebar.component';
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
import { ContourDetailsComponent } from './components/contour-details/contour-details.component';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { ColorLegendComponent } from 'src/modules/ui/components/color-legend/color-legend.component';
import { MapControlComponent } from 'src/modules/ui/components/map-control/map-control.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SimplePieChartComponent } from './components/simple-pie-chart/simple-pie-chart.component';
import { MenuComponent } from 'src/modules/ui/components/menu/menu.component';
import { SkeletonComponent } from 'src/modules/ui/components/skeleton/skeleton.component';
import { TooltipComponent } from 'src/modules/ui/components/tooltip/tooltip.component';
import { SettingsComponent } from './components/contour-filter/components/settings.component';
import { SplitMapComponent } from './components/split-map/split-map.component';
import { ContourHoverInfoComponent } from './components/contour-hover-info/contour-hover-info.component';

@NgModule({
  declarations: [
    CroplandMapComponent,
    ContourFilterComponent,
    ContourAddComponent,
    SplineAreaChartComponent,
    ContourFormComponent,
    SplitMapSidebarComponent,
    ContourEditComponent,
    ContourDetailsComponent,
    StatisticsComponent,
    SimplePieChartComponent,
    SettingsComponent,
    ContourHoverInfoComponent,
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
    ColorLegendComponent,
    MapControlComponent,
    MenuComponent,
    SkeletonComponent,
    TooltipComponent,
  ],
  providers: [MapService, TranslatePipe],
})
export class CroplandMapModule {}
