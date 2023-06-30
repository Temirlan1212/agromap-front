import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsComponent } from './contacts.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ContactsRoutingModule } from './contacts-routing.module';
import { SidePanelComponent } from 'src/modules/ui/components/side-panel/side-panel.component';
import { SvgIconComponent } from 'src/modules/ui/components/svg-icon/svg-icon.component';
import { ContactInformationsComponent } from './components/contact-informations/contact-informations.component';
import { ContactInformationComponent } from './components/contact-information/contact-information.component';
import { LoadingComponent } from 'src/modules/ui/components/loading/loading.component';
import { MapComponent } from 'src/modules/ui/components/map/map.component';
import { MapService } from 'src/modules/ui/services/map.service';

@NgModule({
  declarations: [
    ContactsComponent,
    ContactInformationsComponent,
    ContactInformationComponent,
  ],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    TranslateModule,
    SidePanelComponent,
    SvgIconComponent,
    LoadingComponent,
    MapComponent,
  ],
  providers: [TranslatePipe, MapService],
})
export class ContactsModule {}
