import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionaryComponent } from './dictionary.component';
import { DictionaryRoutingModule } from './dictionary-routing.module';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CulturesComponent } from './cultures/cultures.component';
import { CheckExistPipe } from '../../../ui/pipes/check-exist.pipe';
import { SvgIconComponent } from '../../../ui/components/svg-icon/svg-icon.component';
import { CultureAddComponent } from './cultures/components/culture-add/culture-add.component';
import { CultureEditComponent } from './cultures/components/culture-edit/culture-edit.component';
import { CultureFormComponent } from './cultures/components/culture-form/culture-form.component';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';
import { FieldsGroupComponent } from '../../../ui/components/fields-group/fields-group.component';
import { InputComponent } from '../../../ui/components/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormOverlayComponent } from '../../../ui/components/form-overlay/form-overlay.component';
import { QuestionDialogComponent } from '../../../ui/components/question-dialog/question-dialog.component';
import { TableComponent } from 'src/modules/ui/components/table/table.component';
import { RegionsComponent } from './regions/regions.component';
import { DistrictsComponent } from './districts/districts.component';
import { ContonsComponent } from './contons/contons.component';
import { IndexesComponent } from './indexes/indexes.component';
import { FormFieldComponent } from '../../../ui/components/form-field/form-field.component';
import { ContentTabsComponent } from '../../../ui/components/content-tabs/content-tabs.component';
import { TabComponent } from '../../../ui/components/content-tabs/tab/tab.component';

@NgModule({
  declarations: [
    DictionaryComponent,
    CulturesComponent,
    CultureAddComponent,
    CultureEditComponent,
    CultureFormComponent,
    RegionsComponent,
    DistrictsComponent,
    ContonsComponent,
    IndexesComponent,
  ],
  imports: [
    CommonModule,
    DictionaryRoutingModule,
    SidePanelComponent,
    TranslateModule,
    CheckExistPipe,
    SvgIconComponent,
    LoadingComponent,
    FieldsGroupComponent,
    InputComponent,
    ReactiveFormsModule,
    FormOverlayComponent,
    QuestionDialogComponent,
    TableComponent,
    FormFieldComponent,
    ContentTabsComponent,
    TabComponent,
  ],
  providers: [TranslatePipe],
})
export class DictionaryModule {}
