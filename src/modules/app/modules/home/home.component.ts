import { Component, ElementRef, ViewChild } from '@angular/core';
import { geoJSON, Map, TileLayer, tileLayer } from 'leaflet';
import { ApiService } from 'src/modules/api/api.service';
import { MapData, MapLayerFeature, MapMove } from 'src/modules/ui/models/map.model';
import { MapService } from './map.service';
import { ActualVegQuery } from '../../../api/classes/veg.api';
import { MessagesService } from '../../../ui/components/services/messages.service';
import { IChartData } from './components/spline-area-chart/spline-area-chart.component';
import { MapComponent } from '../../../ui/components/map/map.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('featurePopup') featurePopup!: ElementRef<HTMLElement>;
  @ViewChild('map') mapComponent!: MapComponent;

  wms: TileLayer = tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
    layers: 'agromap:agromap_store',
    format: 'image/png',
    transparent: true,
  });

  mapData: MapData | null = null;
  layerFeature: MapLayerFeature | null = null;
  selectedLayer: any;
  contourData: IChartData[] = [];

  constructor(private api: ApiService, private mapService: MapService, private messages: MessagesService) {
    this.mapService.contourEdited.subscribe(() => this.mapComponent.handleMapEventSubscription());
  }

  handleMapData(mapData: MapData): void {
    mapData.map.addLayer(this.wms);
    this.mapData = mapData;
    this.mapService.map.next(mapData);
  }

  handleFeatureClick(layerFeature: MapLayerFeature): void {
    if (this.layerFeature) {
      this.selectedLayer.remove();
    }
    const cid = layerFeature?.feature?.properties?.['contour_id'] ?? layerFeature?.feature?.properties?.['id'];
    this.getContourData(cid);
    this.layerFeature = layerFeature;
    this.selectedLayer = geoJSON(this.layerFeature?.feature).addTo(this.mapData?.map as Map)
      .setStyle({
        fillOpacity: 1,
        fillColor: '#f6ab39',
      });
  }

  handleFeatureClose(): void {
    this.layerFeature = null;
    this.selectedLayer.remove();
  }

  async getContourData(id: number) {
    const query: ActualVegQuery = { contour_id: id };
    try {
      const res = await this.api.veg.getActualVegIndexes(query);
      const data = res?.reduce((acc: any, i) => {
        if (!acc[i.index.name_ru]) {
          acc[i.index.name_ru] = {};
          acc[i.index.name_ru]['name'] = i.index.name_ru;
          acc[i.index.name_ru]['data'] = [];
          acc[i.index.name_ru]['dates'] = [];
          acc[i.index.name_ru]['data'].push(i.average_value);
          acc[i.index.name_ru]['dates'].push(i.date);
        } else {
          acc[i.index.name_ru]['data'].push(i.average_value);
          acc[i.index.name_ru]['dates'].push(i.date);
        }
        return acc;
      }, {});
      this.contourData = data ? Object.values(data) : [];
    } catch (e: any) {
      this.messages.error(e.message);
      this.contourData = [];
    }
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    if (this.mapData?.map != null) {
      this.mapData.geoJson.clearLayers();

      if (mapMove.zoom >= 12) {
        try {
          const polygons = await this.api.map.getPolygonsInScreen(mapMove.bounds);
          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        }
      }
    }
  }
}
