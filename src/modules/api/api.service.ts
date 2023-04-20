import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormApi } from './classes/form.api';
import { UserApi } from './classes/user.api';
import { DictionaryApi } from './classes/dictionary.api';
import { MapApi } from './classes/map.api';
import { CultureApi } from './classes/culture.api';
import { ContourApi } from './classes/contour.api';
import { VegIndexesApi } from './classes/veg-indexes';
import { AiContourApi } from './classes/ai-contour.api';
import { StatisticsApi } from './classes/statistics.api';
import { AiMiscApi } from './classes/ai-misc.api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly form: FormApi;
  public readonly user: UserApi;
  public readonly dictionary: DictionaryApi;
  public readonly map: MapApi;
  public readonly culture: CultureApi;
  public readonly contour: ContourApi;
  public readonly vegIndexes: VegIndexesApi;
  public readonly aiContour: AiContourApi;
  public readonly statistics: StatisticsApi;
  public readonly ai: AiMiscApi;

  constructor(private http: HttpClient) {
    this.form = new FormApi();
    this.user = new UserApi(this.http);
    this.dictionary = new DictionaryApi(this.http);
    this.map = new MapApi(this.http);
    this.culture = new CultureApi(this.http);
    this.contour = new ContourApi(this.http);
    this.vegIndexes = new VegIndexesApi(this.http);
    this.aiContour = new AiContourApi(this.http);
    this.statistics = new StatisticsApi(this.http);
    this.ai = new AiMiscApi(this.http);
  }
}
