import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IVegIndexOption,
  IVegSatelliteDate,
  IVegSatelliteDatesQuery,
} from '../models/veg-indexes.model';

export class VegIndexesApi {
  constructor(private http: HttpClient) {}

  async getVegSatelliteDates(
    query: IVegSatelliteDatesQuery
  ): Promise<IVegSatelliteDate[]> {
    const response = await firstValueFrom(
      this.http.get<IVegSatelliteDate[]>(
        `veg/satellite_dates/${query.vegIndexId}/${query.contourId}`
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
}
