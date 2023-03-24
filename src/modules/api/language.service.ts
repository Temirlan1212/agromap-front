import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BYPASS_LOG } from './api-interceptor.service';

@Injectable()
export class LanguageService implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http
      .get(`/assets/i18n/${lang}.json`, {
        context: new HttpContext().set(BYPASS_LOG, true),
      })
      .pipe(map((res) => res));
  }
}
