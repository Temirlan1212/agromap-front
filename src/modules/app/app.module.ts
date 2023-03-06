import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApiErrorService } from '../api/api-error.service';
import { SidenavComponent } from '../ui/components/sidenav/sidenav.component';
import { TooltipModule } from '../ui/components/tooltip/tooltip.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SidenavComponent, TooltipModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: ApiErrorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
