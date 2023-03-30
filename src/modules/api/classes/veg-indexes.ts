import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IVegIndexOption,
  IVegSatelliteDate,
  IVegSatelliteDatesQuery,
} from '../models/veg-indexes.model';
import { ActualVegIndexes } from '../models/actual-veg-indexes';

export interface ActualVegQuery {
  contour_id: number;
}

export class VegIndexesApi {
  constructor(private http: HttpClient) {
  }

  async getVegSatelliteDates(
    query: IVegSatelliteDatesQuery
  ): Promise<IVegSatelliteDate[]> {
    const response = await firstValueFrom(
      this.http.get<IVegSatelliteDate[]>(
        `veg/satellite_dates/${ query.vegIndexId }/${ query.contourId }`
      )
    );

    return response;
  }

  async getVegSatelliteDatesAi(
    query: IVegSatelliteDatesQuery
  ): Promise<IVegSatelliteDate[]> {
    const response = await firstValueFrom(
      this.http.get<IVegSatelliteDate[]>(
        `veg/ai-satellite_dates/${ query.vegIndexId }/${ query.contourId }`
      )
    );

    return response;
  }

  async getVegIndexList(): Promise<IVegIndexOption[]> {
    const response = await firstValueFrom(
      this.http.get<IVegIndexOption[]>(`info/index-list`)
    );

    return response;
  }

  async getActualVegIndexes(query: ActualVegQuery): Promise<ActualVegIndexes[]> {
    return await firstValueFrom(this.http.get<ActualVegIndexes[]>('veg/actual-veg-indexes', { params: query as any }));
  }

  async getActualVegIndexesAi(query: ActualVegQuery): Promise<ActualVegIndexes[]> {
    return await firstValueFrom(this.http.get<ActualVegIndexes[]>('veg/ai-actual-veg-indexes', { params: query as any }));
  }
}
