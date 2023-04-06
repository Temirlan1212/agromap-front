import { HttpClient } from '@angular/common/http';
import { IContour } from '../models/contour.model';
import { firstValueFrom } from 'rxjs';

export class AiContourApi {
  constructor(private http: HttpClient) {}

  async getList(): Promise<Partial<IContour>> {
    return await firstValueFrom(this.http.get<Partial<IContour>>('ai/contour'));
  }

  async getOne(id: number): Promise<IContour> {
    return await firstValueFrom(this.http.get<IContour>(`ai/contour/${id}`));
  }

  async create(data: Partial<IContour>): Promise<Partial<IContour>> {
    return await firstValueFrom(
      this.http.post<Partial<IContour>>('ai/contour', data)
    );
  }

  async update(
    id: number,
    data: Partial<IContour>
  ): Promise<Partial<IContour>> {
    return await firstValueFrom(
      this.http.put<Partial<IContour>>(`ai/contour/${id}`, data)
    );
  }

  async remove(id: number): Promise<Partial<IContour>> {
    return await firstValueFrom(
      this.http.delete<Partial<IContour>>(`ai/contour/${id}`)
    );
  }
}
