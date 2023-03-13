import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormApi } from './classes/form.api';
import { UserApi } from './classes/user.api';
import { DictionaryApi } from './classes/dictionary.api';
import { MapApi } from './classes/map.api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly form: FormApi;
  public readonly user: UserApi;
  public readonly dictionary: DictionaryApi;
  public readonly map: MapApi;

  constructor(private http: HttpClient) {
    this.form = new FormApi();
    this.user = new UserApi(this.http);
    this.dictionary = new DictionaryApi(this.http);
    this.map = new MapApi(this.http);
  }
}
