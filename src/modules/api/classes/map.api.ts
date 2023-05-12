import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LatLngBounds } from 'leaflet';
import { GeoJSON } from 'geojson';
import { IPolygonsInScreenQuery } from '../models/map.model';

export class MapApi {
  constructor(private http: HttpClient) {}

  async getPolygonsInScreen(query: IPolygonsInScreenQuery): Promise<GeoJSON> {
    const { latLngBounds, land_type } = query;
    const response = await firstValueFrom(
      this.http.post<GeoJSON>('gip/polygons-in-screen', latLngBounds, {
        params: { land_type },
      })
    );

    return response;
  }

  async getPolygonsInScreenAi(query: IPolygonsInScreenQuery): Promise<GeoJSON> {
    const { latLngBounds, land_type } = query;
    const response = await firstValueFrom(
      this.http.post<GeoJSON>('ai/contour-in-screen', latLngBounds, {
        params: { land_type },
      })
    );

    return response;
  }
}
