import { HttpClient } from '@angular/common/http';
import { ICulture } from '../models/culture.model';
import { firstValueFrom } from 'rxjs';

export class CultureApi {
  constructor(private http: HttpClient) {
  }

  async getList(): Promise<ICulture[]> {
    return await firstValueFrom(this.http.get<ICulture[]>('gip/culture'));
  }
}
