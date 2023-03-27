import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApiInterceptorService } from '../api/api-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationHostDirective } from '../ui/components/notification/notification-host.directive';
import { SidenavComponent } from '../ui/components/sidenav/sidenav.component';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { LanguageService } from '../api/language.service';
import { NgxTranslateRoutesModule } from 'ngx-translate-routes';
import localeRu from '@angular/common/locales/ru';
import localeKg from '@angular/common/locales/ky';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeKg);

@NgModule({
  declarations: [AppComponent],

  imports: [
    BrowserModule,
    AppRoutingModule,
    SidenavComponent,
    NotificationHostDirective,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LanguageService,
        deps: [HttpClient],
      },
      defaultLanguage: 'ru'
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: ApiInterceptorService,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'ky' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
