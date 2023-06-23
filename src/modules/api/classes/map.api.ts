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

  async getFeatureInfo(query: IGetFeatureInfoQuery): Promise<GeoJSON> {
    const response = await firstValueFrom(
      this.http.get<GeoJSON>(environment.geoserverUrl + '/agromap/wms', {
        params: query as any,
        context: new HttpContext().set(BYPASS_LOG, true),
      })
    );

    return response;
  }
}
