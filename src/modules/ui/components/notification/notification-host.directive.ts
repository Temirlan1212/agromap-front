import { Directive, ViewContainerRef } from '@angular/core';
import { MessagesService } from '../services/messages.service';

@Directive({
  selector: '[appNotificationHost]',
  standalone: true,
})
export class NotificationHostDirective {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private messages: MessagesService,
  ) {
    this.messages.setViewContainerRef(this.viewContainerRef);
  }

}
