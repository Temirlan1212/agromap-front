import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IContour } from '../models/contour.model';

export class ContourApi {
  constructor(private http: HttpClient) {}

  async getOne(id: number): Promise<IContour> {
    return await firstValueFrom(this.http.get<IContour>(`gip/contour/${id}`));
  }

  async create(data: Partial<IContour>): Promise<IContour> {
    return await firstValueFrom(this.http.post<IContour>('gip/contour', data));
  }

  async update(id: number, data: Partial<IContour>): Promise<IContour> {
    return await firstValueFrom(
      this.http.put<IContour>(`gip/contour/${id}`, data)
    );
  }

  async remove(id: number): Promise<IContour> {
    return await firstValueFrom(
      this.http.delete<IContour>(`gip/contour/${id}`)
    );
  }

  async getFilteredContours(query: any): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>('gip/filter_contour', { params: query as any })
    );
  }
}
