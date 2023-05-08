import { HttpClient } from '@angular/common/http';
import { ICultureIndicators, ICulture } from '../models/culture.model';
import { firstValueFrom } from 'rxjs';

export class CultureApi {
  constructor(private http: HttpClient) {}

  async getList(): Promise<ICulture[]> {
    return await firstValueFrom(this.http.get<ICulture[]>('gip/culture'));
  }

  async getOne(id: number): Promise<ICulture> {
    return await firstValueFrom(this.http.get<ICulture>(`gip/culture/${id}`));
  }

  async create(data: Partial<ICulture>): Promise<ICulture> {
    return await firstValueFrom(this.http.post<ICulture>('gip/culture', data));
  }

  async update(id: number, data: Partial<ICulture>): Promise<ICulture> {
    return await firstValueFrom(
      this.http.put<ICulture>(`gip/culture/${id}`, data)
    );
  }

  async delete(id: number): Promise<ICulture> {
    return await firstValueFrom(
      this.http.delete<ICulture>(`gip/culture/${id}`)
    );
  }

  async getCultureIndicators(id: number): Promise<ICultureIndicators[]> {
    return await firstValueFrom(
      this.http.get<ICultureIndicators[]>(`ai/pivot_table_culture`, {
        params: { culture: id },
      })
    );
  }
}
