import { Injectable, ViewContainerRef } from '@angular/core';
import { NotificationComponent } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private viewContainerRef!: ViewContainerRef;
  messages = {
    abortedRequest: 'The user aborted a request.',
    400: '',
    500: '',
  };

  constructor() {
    Object.defineProperty(window, 'agroMessages', { value: this });
  }

  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  clear() {
    this.viewContainerRef.clear();
  }

  error(message: string, timeout: number = 3000): void {
    this.clear();
    const componentRef = this.viewContainerRef.createComponent(
      NotificationComponent
    );
    componentRef.instance.message = message;
    componentRef.instance.isError = true;
    componentRef.instance.closeCallback = () => componentRef.destroy();
    setTimeout(() => componentRef.destroy(), timeout);
  }

  success(message: string, timeout: number = 3000): void {
    this.clear();
    const componentRef = this.viewContainerRef.createComponent(
      NotificationComponent
    );
    componentRef.instance.message = message;
    componentRef.instance.isSuccess = true;
    componentRef.instance.closeCallback = () => componentRef.destroy();
    setTimeout(() => componentRef.destroy(), timeout);
  }

  info(message: string, timeout: number = 3000): void {
    this.clear();
    const componentRef = this.viewContainerRef.createComponent(
      NotificationComponent
    );
    componentRef.instance.message = message;
    componentRef.instance.isInfo = true;
    componentRef.instance.closeCallback = () => componentRef.destroy();
    setTimeout(() => componentRef.destroy(), timeout);
  }

  warning(message: string, timeout: number = 3000): void {
    this.clear();
    const componentRef = this.viewContainerRef.createComponent(
      NotificationComponent
    );
    componentRef.instance.message = message;
    componentRef.instance.isWarning = true;
    componentRef.instance.closeCallback = () => componentRef.destroy();
    setTimeout(() => componentRef.destroy(), timeout);
  }
}
