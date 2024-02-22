import { Injectable } from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { MapData } from 'src/modules/ui/models/map.model';
import { MessagesService } from 'src/modules/ui/services/messages.service';
import { CroplandMainMapService } from '../services/map.service';
import { Feature } from 'geojson';
import 'leaflet.vectorgrid';
import * as L from 'leaflet';

type FeatureProperties = {
  id: string;
};

@Injectable({ providedIn: 'root' })
export class PBFConroller {
  mapData: MapData | null = null;
  VG: any = L;
  tileLayer: any = null;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private mapService: CroplandMainMapService
  ) {
    this.mapService.map.subscribe(async (mapData) => (this.mapData = mapData));
  }

  getVectorUrls() {
    const baseUrl = 'https://geoserver.24mycrm.com';
    const workspace = 'agromap';
    const layerName = 'contours_main';
    const format = 'application/x-protobuf;type=mapbox-vector';
    const fullUrl =
      baseUrl +
      '/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS' +
      '&VERSION=1.0.0&LAYER=' +
      workspace +
      ':' +
      layerName +
      '&STYLE=&TILEMATRIX=EPSG:900913:{z}' +
      '&TILEMATRIXSET=EPSG:900913&FORMAT=' +
      format +
      '&TILECOL={x}&TILEROW={y}';

    return { fullUrl, baseUrl, workspace, layerName, format };
  }

  getVectorStyles(layerName: string) {
    var style: Record<string, any> = {};
    style[layerName] = function () {
      return {
        fillOpacity: 1,
        fillColor: 'transparent',
        fill: true,
        color: 'blue',
        opacity: 1,
        weight: 0.5,
      };
    };
    return style;
  }

  getVectorOptions() {
    return {
      rendererFactory: this.VG.canvas.tile,
      minZoom: 0,
      maxNativeZoom: 19,
      interactive: true,
      zIndex: 100000,
      getFeatureId: function (feature: Feature<any, FeatureProperties>) {
        return feature.properties['id'];
      },
      vectorTileLayerStyles: this.getVectorStyles(
        this.getVectorUrls().layerName
      ),
    };
  }

  initVectorTileLayer(map: MapData['map']) {
    this.tileLayer = this.VG.vectorGrid.protobuf(
      this.getVectorUrls().fullUrl,
      this.getVectorOptions()
    );
    this.tileLayer.addTo(map);
  }

  initSchema() {
    const map = this.mapData?.map;
    if (map == null) return;
    this.initVectorTileLayer(map);
  }
}
