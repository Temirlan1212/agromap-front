import { Component, ElementRef, ViewChild } from '@angular/core';
import { TileLayer, tileLayer } from 'leaflet';
import { Feature } from 'geojson';
import { ApiService } from 'src/modules/api/api.service';
import { MapData, MapLayerFeature, MapMove } from 'src/modules/ui/models/map.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;

  wms: TileLayer = tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
    layers: 'agromap:agromap_store',
    format: 'image/png',
    transparent: true,
  });

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;

  constructor(private api: ApiService) {}

  handleMapData(mapData: MapData): void {
    mapData.map.addLayer(this.wms);
    this.mapData = mapData;
  }

  handleFeatureClick(layerFeature: MapLayerFeature): void {
    this.layerFeature = layerFeature;
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    if (this.mapData?.map != null) {
      this.mapData.geoJson.clearLayers();

      if (mapMove.zoom >= 12) {
        try {
          const polygons = await this.api.map.getPolygonsInScreen(mapMove.bounds);
          console.log(polygons);
          this.mapData.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        }
      }
    }
  }
}
