import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BYPASS_LOG } from './api-interceptor.service';

@Injectable()
export class LanguageService implements TranslateLoader {
  baseUrl = 'http://localhost:4200/assets/i18n/';

  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string): Observable<any> {
    //TODO: change translations baseUrl on after deployment
    return this.http.get(`${ this.baseUrl }${ lang }.json`, { context: new HttpContext().set(BYPASS_LOG, true) })
      .pipe(map((res) => res));
  }

}
