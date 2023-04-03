import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionaryComponent } from './dictionary.component';
import { DictionaryRoutingModule } from './dictionary-routing.module';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DictionaryComponent
  ],
  imports: [
    CommonModule,
    DictionaryRoutingModule,
    SidePanelComponent,
    TranslateModule
  ]
})
export class DictionaryModule {
}
