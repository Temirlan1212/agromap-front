import { Component, ElementRef, ViewChild } from '@angular/core';
import { TileLayer, tileLayer } from 'leaflet';
import { ApiService } from 'src/modules/api/api.service';
import { IVegIndexOption, IVegSatelliteDate } from 'src/modules/api/models/veg-indexes.model';
import { MapData, MapLayerFeature, MapMove } from 'src/modules/ui/models/map.model';
import { MapService } from './map.service';

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
  layerContourId: string = '';

  vegIndexesData: IVegSatelliteDate[] = [];
  vegIndexOptionsList: IVegIndexOption[] = [];

  constructor(private api: ApiService, private mapService: MapService) {
  }

  handleMapData(mapData: MapData): void {
    mapData.map.addLayer(this.wms);
    this.mapData = mapData;
    this.mapService.map.next(mapData);
  }

  handleFeatureClick(layerFeature: MapLayerFeature): void {
    this.layerFeature = layerFeature;
    this.layerContourId = this.layerFeature.feature.properties?.['id'].toString();

    this.getVegIndexList();
    this.getVegSatelliteDates(this.layerContourId)
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
          this.mapData.geoJson.options.snapIgnore = true;
          this.mapData.geoJson.options.pmIgnore = true;
          this.mapData.geoJson.addData(polygons);
        } catch (e: any) {
          console.log(e);
        }
      }
    }
  }

  async getVegSatelliteDates(contoruId: string, vegIndexId: string = '1'): Promise<void> {
    try {
      this.vegIndexesData = await this.api.vegIndexes.getVegSatelliteDates({
        contourId: contoruId,
        vegIndexId: vegIndexId,
      }) as IVegSatelliteDate[];
    } catch (e: any) {
      console.log(e);
    }
  }

  async getVegIndexList() {
    try {
      this.vegIndexOptionsList =
        await this.api.vegIndexes.getVegIndexList() as IVegIndexOption[];
    } catch (e: any) {
      console.log(e);
    }
  }

  handleVegIndexOptionClick(vegIndexOption: IVegIndexOption) {
    this.getVegSatelliteDates(this.layerContourId, vegIndexOption.id.toString())
  }
}
