import { Component, HostBinding, Input } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent
  ]
})
export class NotificationComponent {

  @Input() message: string = '';
  @Input() actionName: string = '';

  @HostBinding('class.info') isInfo: boolean = false;
  @HostBinding('class.warning') isWarning: boolean = false;
  @HostBinding('class.error') isError: boolean = false;
  @HostBinding('class.success') isSuccess: boolean = false;

  closeCallback() {}
}
