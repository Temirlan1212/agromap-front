import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { IGetFeatureInfoQuery } from '../models/map.model';
import { environment } from 'src/environments/environment';
import { BYPASS_LOG } from '../api-interceptor.service';
import { IPolygonsInScreenQuery } from '../models/map.model';
import { UserApi } from './user.api';

export class MapApi {
  constructor(private http: HttpClient, private userApi: UserApi) {}

  async getPolygonsInScreen(
    query: IPolygonsInScreenQuery,
    signal?: AbortSignal
  ): Promise<GeoJSON> {
    const { latLngBounds, land_type, year, culture } = query;
    const params = new URLSearchParams();
    land_type && params.append('land_type', String(land_type));
    year && params.append('year', String(year));
    culture && params.append('culture', String(culture));
    const token = this.userApi.getLoggedInUser()?.token;
    let headers: HeadersInit = {};
    if (token != null) headers['Authorization'] = `token ${token}`;

    const response = await fetch(
      `${environment.apiUrl}/gip/polygons-in-screen/?${params}`,
      {
        method: 'POST',
        body: JSON.stringify(latLngBounds),
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: signal,
      }
    );

    return await response.json();
  }

  async getPolygonsInScreenAi(query: IPolygonsInScreenQuery): Promise<GeoJSON> {
    const { latLngBounds, land_type, year, culture } = query;
    const params: any = { land_type, year };
    if (culture != null) params.culture = culture;

    const response = await firstValueFrom(
      this.http.post<GeoJSON>('ai/contour-in-screen', latLngBounds, {
        params,
      })
    );

    return response;
  }

  async getFeatureInfo(
    query: Partial<IGetFeatureInfoQuery> & {
      bbox: string;
      query_layers: string;
      layers: string;
    }
  ): Promise<GeoJSON> {
    const params = {
      service: 'WMS',
      request: 'GetFeatureInfo',
      srs: 'EPSG:4326',
      styles: '',
      format: 'image/png',
      transparent: true,
      width: 101,
      height: 101,
      x: 50,
      y: 50,
      version: '1.1.1',
      info_format: 'application/json',
      ...query,
    };

    const response = await firstValueFrom(
      this.http.get<GeoJSON>(environment.geoserverUrl + '/agromap/wms', {
        params: params,
        context: new HttpContext().set(BYPASS_LOG, true),
      })
    );

    return response;
  }
}
