import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsComponent } from './contacts.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ContactsRoutingModule } from './contacts-routing.module';
import { SidePanelComponent } from 'src/modules/ui/components/side-panel/side-panel.component';

@NgModule({
  declarations: [ContactsComponent],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    TranslateModule,
    SidePanelComponent,
  ],
  providers: [TranslatePipe],
})
export class ContactsModule {}
