import { Component } from '@angular/core';
import { Map, TileLayer, tileLayer, GeoJSON, geoJSON } from 'leaflet';
import { ApiService } from 'src/modules/api/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  wms: TileLayer = tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
    layers: 'agromap:agromap_store',
    format: 'image/png',
    transparent: true,
  });
  geoJson: GeoJSON = geoJSON();
  mapInstance: Map | null = null;

  constructor(private api: ApiService) {}

  handleMapInstance(mapInstance: Map): void {
    mapInstance.addLayer(this.wms);
    mapInstance.addLayer(this.geoJson);
    this.mapInstance = mapInstance;
    this.mapInstance.on('moveend', this.handleMapMove.bind(this));
  }

  async handleMapMove(): Promise<void> {
    if (this.mapInstance != null) {
      const bounds = this.mapInstance.getBounds();
      const zoom = this.mapInstance.getZoom();

      this.geoJson.clearLayers();

      if (zoom >= 12) {
        try {
          const polygons = await this.api.map.getPolygonsInScreen(bounds);
          this.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        }
      }
    }
  }
}
