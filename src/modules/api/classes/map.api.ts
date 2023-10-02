import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { IGetFeatureInfoQuery } from '../models/map.model';
import { environment } from 'src/environments/environment';
import { BYPASS_LOG } from '../api-interceptor.service';
import { IPolygonsInScreenQuery } from '../models/map.model';

export class MapApi {
  constructor(private http: HttpClient) {}

  async getPolygonsInScreen(query: IPolygonsInScreenQuery): Promise<GeoJSON> {
    const { latLngBounds, land_type, year, culture } = query;
    const params: any = { land_type, year };
    if (culture != null) params.culture = culture;

    const response = await firstValueFrom(
      this.http.post<GeoJSON>('gip/polygons-in-screen', latLngBounds, {
        params,
      })
    );

    return response;
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
    query: Pick<IGetFeatureInfoQuery, 'bbox' | 'layers' | 'query_layers'>
  ): Promise<GeoJSON> {
    const params: Partial<IGetFeatureInfoQuery> = {
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
