import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LatLngBounds } from 'leaflet';
import { GeoJSON } from 'geojson';

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
}
