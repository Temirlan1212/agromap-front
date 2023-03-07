import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApiErrorService } from '../api/api-error.service';
import { SidenavComponent } from '../ui/components/sidenav/sidenav.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationHostDirective } from '../ui/components/notification/notification-host.directive';

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SidenavComponent,
        NotificationHostDirective,
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: ApiErrorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
