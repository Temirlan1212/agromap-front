import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ActualVegIndexes } from '../models/actual-veg-indexes';

export interface ActualVegQuery {
  contour_id: number;
}

export class VegApi {
  constructor(private http: HttpClient) {
  }

  async getActualVegIndexes(query: ActualVegQuery): Promise<ActualVegIndexes[]> {
    return await firstValueFrom(this.http.get<ActualVegIndexes[]>('veg/actual-veg-indexes', { params: query as any }));
  }

}
