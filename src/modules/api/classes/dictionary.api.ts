import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { IRegion, IRegionListQuery } from '../models/region.model';
import { IConton, IContonListQuery } from '../models/conton.model';
import { IDistrict, IDistrictListQuery } from '../models/district.model';
import { ILandType } from '../models/land-type.model';

export class DictionaryApi {
  constructor(private http: HttpClient) {
  }

  async getRegions(query?: IRegionListQuery): Promise<(IRegion | GeoJSON)[]> {
    const response = await firstValueFrom(
      this.http.get<(IRegion | GeoJSON)[]>('gip/region', {
        params: query as any,
      })
    );

    return response;
  }

  async getConstons(query?: IContonListQuery): Promise<IConton[]> {
    return await firstValueFrom(
      this.http.get<IConton[]>('gip/conton', {
        params: query as any,
      })
    );
  }

  async getDistricts(query?: IDistrictListQuery): Promise<IDistrict[]> {
    return await firstValueFrom(
      this.http.get<IDistrict[]>('gip/district', {
        params: query as any,
      })
    );
  }

  async getLandType(): Promise<ILandType[]> {
    return await firstValueFrom(
      this.http.get<ILandType[]>('gip/land-type'));
  }
}
