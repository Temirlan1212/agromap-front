import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { IRegion, IRegionListQuery } from '../models/region.model';

export class DictionaryApi {
  constructor(private http: HttpClient) {}

  async getRegions(query: IRegionListQuery): Promise<(IRegion | GeoJSON)[]> {
    const response = await firstValueFrom(
      this.http.get<(IRegion | GeoJSON)[]>('gip/region', {
        params: query as any,
      })
    );

    return response;
  }
}
