import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LatLngBounds } from 'leaflet';
import { GeoJSON } from 'geojson';
import { IGetFeatureInfoQuery } from '../models/map.model';
import { environment } from 'src/environments/environment';
import { BYPASS_LOG } from '../api-interceptor.service';

export class MapApi {
  constructor(private http: HttpClient) {}

  async getPolygonsInScreen(data: LatLngBounds): Promise<GeoJSON> {
    const response = await firstValueFrom(
      this.http.post<GeoJSON>('gip/polygons-in-screen', data)
    );

    return response;
  }

  async getPolygonsInScreenAi(data: LatLngBounds): Promise<GeoJSON> {
    const response = await firstValueFrom(
      this.http.post<GeoJSON>('ai/contour-in-screen', data)
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
