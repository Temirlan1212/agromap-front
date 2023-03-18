import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApiInterceptorService } from '../api/api-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationHostDirective } from '../ui/components/notification/notification-host.directive';
import { SidenavComponent } from '../ui/components/sidenav/sidenav.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SidenavComponent,
        NotificationHostDirective,
        HttpClientModule
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: ApiInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
