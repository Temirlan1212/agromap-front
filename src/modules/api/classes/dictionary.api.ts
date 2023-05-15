import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IRegion, IRegionListQuery } from '../models/region.model';
import {
  IConton,
  IContonListQuery,
  IContonWithPagination,
} from '../models/conton.model';
import {
  IDistrict,
  IDistrictListQuery,
  IDistrictWithPagination,
} from '../models/district.model';
import { ILandType } from '../models/land-type.model';
import { Index } from '../models/actual-veg-indexes';
import { SoilClass } from '../models/soil.model';

export class DictionaryApi {
  constructor(private http: HttpClient) {}

  async getRegions(query?: IRegionListQuery): Promise<IRegion[]> {
    const response = await firstValueFrom(
      this.http.get<IRegion[]>('gip/region', {
        params: query as any,
      })
    );

    return response;
  }

  async getContons(
    query?: IContonListQuery
  ): Promise<IConton[] | IContonWithPagination> {
    return await firstValueFrom(
      this.http.get<IConton[]>('gip/conton', {
        params: { ...query } as any,
      })
    );
  }

  async getDistricts(
    query?: IDistrictListQuery
  ): Promise<IDistrict[] | IDistrictWithPagination> {
    return await firstValueFrom(
      this.http.get<IDistrict[] | IDistrictWithPagination>('gip/district', {
        params: { ...query } as any,
      })
    );
  }

  async getLandType(): Promise<ILandType[]> {
    return await firstValueFrom(this.http.get<ILandType[]>('gip/land-type'));
  }

  async getIndexes(): Promise<Index[]> {
    return await firstValueFrom(this.http.get<Index[]>('info/index-list'));
  }

  async getSoilClasses(): Promise<SoilClass[]> {
    return await firstValueFrom(this.http.get<SoilClass[]>('gip/soil-class'));
  }
}
