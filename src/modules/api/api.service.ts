import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormApi } from './classes/form-api';
import { UserApi } from './classes/user.api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly form: FormApi;
  public readonly user: UserApi;

  constructor(private http: HttpClient) {
    this.form = new FormApi();
    this.user = new UserApi(this.http);
  }
}
