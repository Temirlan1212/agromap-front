import { Injectable } from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { MapData } from 'src/modules/ui/models/map.model';
import { MessagesService } from 'src/modules/ui/services/messages.service';
import { CroplandMainMapService } from '../services/map.service';
import { Feature } from 'geojson';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';

const initLayerProperties = {
  area: 0,
  cdstr: 0,
  cntn: 0,
  dst: 0,
  id: 0,
  ltype: 0,
  prd_clt_id: 0,
  prd_clt_n: '',
  prdvty: '',
  rgn: 0,
  year: '',
};

type LayerProperties = {
  id: number;
  area: number;
  cdstr: number;
  cntn: number;
  dst: number;
  ltype: number;
  prd_clt_id: number;
  prd_clt_n: string;
  prdvty: string;
  rgn: number;
  year: string;
};

type LayerVar = {
  hoverProperites: LayerProperties;
  selectProperties: LayerProperties;
};

type MapEvents = {
  onInit: () => void;
  onReset: () => void;
};

type VectorGridEvents = {
  onSelect: (props: LayerProperties) => void;
  onReset: (props: LayerProperties) => void;
  onHover: (props: LayerProperties) => void;
};

@Injectable({ providedIn: 'root' })
export class PBFConroller {
  mapData: MapData | null = null;
  VG: any = L;
  vectorGrid: any = null;
  myScriptElement!: HTMLScriptElement;
  layer: LayerVar = {
    selectProperties: initLayerProperties,
    hoverProperites: initLayerProperties,
  };

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private mapService: CroplandMainMapService
  ) {
    this.mapService.map.subscribe(async (mapData) => (this.mapData = mapData));
  }

  private getVectorUrls() {
    const baseUrl = environment.geoserverUrl;
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

  private getVectorStyles(layerName: string) {
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

  private getVectorOptions() {
    return {
      rendererFactory: this.VG.canvas.tile,
      minZoom: 0,
      maxNativeZoom: 19,
      interactive: true,
      zIndex: 100000,
      getFeatureId: function (feature: Feature<any, LayerProperties>) {
        return feature.properties['id'];
      },
      vectorTileLayerStyles: this.getVectorStyles(
        this.getVectorUrls().layerName
      ),
    };
  }

  private initVectorTileLayer(map: MapData['map']) {
    this.vectorGrid = this.VG.vectorGrid.protobuf(
      this.getVectorUrls().fullUrl,
      this.getVectorOptions()
    );
    this.vectorGrid.addTo(map);
  }

  private removeVectorTileLayer(map: MapData['map']) {
    if (!this.vectorGrid) return;
    map.removeLayer(this.vectorGrid);
  }

  private mapEvents(map: MapData['map'], { onInit, onReset }: MapEvents) {
    let status: 'initialized' | 'default' = 'default';
    map.on({
      zoom: (e) => {
        const zoom = e.target?._zoom;
        if (zoom >= 12 && status === 'default') {
          onInit();
          status = 'initialized';
        }
        if (zoom < 12 && status === 'initialized') {
          onReset();
          status = 'default';
        }
      },
      click: () => {
        if (!!this.layer.selectProperties.id) {
          if (this.vectorGrid) {
            const setDefault = this.LayerViewMethods(
              this.vectorGrid
            ).setDefault;
            setDefault(this.layer.selectProperties.id);
          }
        }
      },

      mousemove: () => {
        if (
          !!this.layer.hoverProperites.id &&
          this.layer.hoverProperites.id !== this.layer.selectProperties.id
        ) {
          if (this.vectorGrid) {
            const setDefault = this.LayerViewMethods(
              this.vectorGrid
            ).setDefault;
            setDefault(this.layer.hoverProperites.id);
          }
        }
      },
    });
  }

  private vectorGridEvents(
    vectorGrid: any,
    { onSelect, onReset, onHover }: Partial<VectorGridEvents>
  ) {
    let prevClickId: number = 0;
    let prevHoverId: number = 0;
    vectorGrid.on({
      mousemove: (e: any) => {
        L.DomEvent.stopPropagation(e);
        let properties: LayerProperties = initLayerProperties;
        if (e?.layer?.properties) properties = e.layer.properties;
        if (!properties?.['id']) return;
        const currId = properties['id'];

        const { setHover, setDefault } = this.LayerViewMethods(vectorGrid);

        if (!!currId && currId !== prevHoverId && prevHoverId !== prevClickId) {
          if (currId !== prevClickId) setHover(currId);
          if (!!prevHoverId) setDefault(prevHoverId);
          onHover && onHover(properties);
        }
        prevHoverId = currId;
      },
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        let properties: LayerProperties = initLayerProperties;
        if (e?.layer?.properties) properties = e.layer.properties;
        if (!properties?.['id']) return;
        const currId = properties['id'];

        const { setActive, setDefault } = this.LayerViewMethods(vectorGrid);

        if (!!currId && currId !== prevClickId) {
          setActive(currId);
          if (!!prevClickId) setDefault(prevClickId);
          onSelect && onSelect(properties);
        }
        if (currId === prevClickId) {
          setDefault(currId);
          prevClickId = 0;
          onReset && onReset(initLayerProperties);
          return;
        }

        prevClickId = currId;
      },
    });
  }

  private LayerViewMethods(vectorGrid: any) {
    return {
      setActive: (id: number) => {
        vectorGrid.setFeatureStyle(
          id,
          {
            color: 'red',
          },
          100
        );
      },
      setDefault: (id: number) => {
        vectorGrid.setFeatureStyle(id, {
          color: 'blue',
          weight: 0.5,
        });
      },
      setHover: (id: number) => {
        vectorGrid.setFeatureStyle(
          id,
          {
            color: 'green',
          },
          100
        );
      },
    };
  }

  private configurations() {
    (L.DomEvent as any).fakeStop = () => 0;
  }

  private initVectorGridEvents() {
    this.vectorGridEvents(this.vectorGrid, {
      onSelect: (props) => {
        this.layer.selectProperties = props;
      },
      onReset: (props) => {
        this.layer.selectProperties = props;
      },
      onHover: (props) => {
        this.layer.hoverProperites = props;
      },
    });
  }

  initSchema() {
    const map = this.mapData?.map;
    if (map == null) return;
    this.configurations();
    this.mapEvents(map, {
      onInit: () => {
        this.initVectorTileLayer(map);

        if (this.vectorGrid) this.initVectorGridEvents();
      },
      onReset: () => {
        this.removeVectorTileLayer(map);
      },
    });
  }
}
