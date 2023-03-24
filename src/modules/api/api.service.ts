import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormApi } from './classes/form.api';
import { UserApi } from './classes/user.api';
import { DictionaryApi } from './classes/dictionary.api';
import { MapApi } from './classes/map.api';
import { CultureApi } from './classes/culture.api';
import { ContourApi } from './classes/contour.api';
import { VegApi } from './classes/veg.api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly form: FormApi;
  public readonly user: UserApi;
  public readonly dictionary: DictionaryApi;
  public readonly map: MapApi;
  public readonly culture: CultureApi;
  public readonly contour: ContourApi;
  public readonly veg: VegApi;


  constructor(private http: HttpClient) {
    this.form = new FormApi();
    this.user = new UserApi(this.http);
    this.dictionary = new DictionaryApi(this.http);
    this.map = new MapApi(this.http);
    this.culture = new CultureApi(this.http);
    this.contour = new ContourApi(this.http);
    this.veg = new VegApi(this.http);
  }
}
