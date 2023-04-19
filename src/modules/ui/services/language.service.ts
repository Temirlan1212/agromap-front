import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BYPASS_LOG } from '../../api/api-interceptor.service';
import { ELanguageCode, ILanguageStore } from '../models/language.model';

@Injectable()
export class LanguageService implements TranslateLoader {
  transform(arg0: string): string {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http
      .get(`/assets/i18n/${lang}.json`, {
        context: new HttpContext().set(BYPASS_LOG, true),
      })
      .pipe(map((res) => res));
  }

  getInitialLanguageStore(): ILanguageStore {
    const initialLanguageStore: ILanguageStore = {
      default: ELanguageCode.ru,
      current: ELanguageCode.ru,
      all: [
        { code: ELanguageCode.en, name: 'English' },
        { code: ELanguageCode.ru, name: 'Russian' },
        { code: ELanguageCode.ky, name: 'Kyrgyz' },
      ],
    };

    return initialLanguageStore;
  }
}
