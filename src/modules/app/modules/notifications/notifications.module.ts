import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';
import { SvgIconComponent } from '../../../ui/components/svg-icon/svg-icon.component';
import { TableComponent } from '../../../ui/components/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    LoadingComponent,
    SvgIconComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class NotificationsModule {}
