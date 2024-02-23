import { Injectable } from '@angular/core';
import { MapData } from 'src/modules/ui/models/map.model';
import { CroplandMainMapService } from '../services/map.service';
import { Feature } from 'geojson';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';
import { LayerProperties } from '../_models';
import { initLayerProperties } from '../_constants';
import { CroplandMainLayerService } from '../services/layer.service';

type MapEvents = {
  onInit: () => void;
  onReset: () => void;
};

type VectorGridEvents = {
  onSelect: (props: LayerProperties) => void;
  onReset: (props: LayerProperties) => void;
  onHover: (props: LayerProperties) => void;
};

type latLngs = {
  vector: {
    click: L.LatLng | null;
  };
};

@Injectable({ providedIn: 'root' })
export class PBFConroller {
  mapData: MapData | null = null;
  VG: any = L;
  vectorGrid: any = null;
  myScriptElement!: HTMLScriptElement;
  ids = {
    vector: {
      prevClickId: 0,
      prevHoverId: 0,
    },
  };
  zoom = {
    currentMapZoom: 0,
    layerSelectedMaxZoom: 16,
    layerUnselectedZoom: 14,
  };

  constructor(
    private mapService: CroplandMainMapService,
    private layerService: CroplandMainLayerService
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
        fillOpacity: 0.3,
        fillColor: 'white',
        fill: true,
        color: 'blue',
        opacity: 1,
        weight: 0,
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
        this.zoom.currentMapZoom = zoom;
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
        const selectId = this.layerService.selectProperties.getValue().id;
        if (!!selectId) {
          if (this.vectorGrid) {
            const setDefault = this.LayerViewMethods(
              this.vectorGrid
            ).setDefault;
            setDefault(selectId);
          }
        }
      },
    });
  }

  private fitActiveVectorBounds = (
    latlng: L.LatLng,
    type: 'select' | 'unselect'
  ) => {
    const map = this.mapData?.map;
    if (!map) return;
    if (type === 'select') {
      const initBounds = L.latLngBounds(L.latLng(latlng), L.latLng(latlng));
      map.fitBounds(initBounds, {
        maxZoom: this.zoom.layerSelectedMaxZoom,
      });
    }
    if (type === 'unselect') this.setUnselectZoom();
  };

  setUnselectZoom() {
    const map = this.mapData?.map;
    if (!map) return;
    const isResetable =
      this.zoom.currentMapZoom > this.zoom.layerUnselectedZoom;
    if (!isResetable) return;
    map.setZoom(this.zoom.layerUnselectedZoom);
  }

  private vectorGridEvents(
    vectorGrid: any,
    { onSelect, onReset, onHover }: Partial<VectorGridEvents>
  ) {
    vectorGrid.on({
      mouseover: (e: any) => {
        L.DomEvent.stopPropagation(e);
        let properties: LayerProperties = initLayerProperties;
        if (e?.layer?.properties) properties = e.layer.properties;
        if (!properties?.['id']) return;
        const currId = properties['id'];
        const { setHover } = this.LayerViewMethods(vectorGrid);
        if (this.ids.vector.prevClickId !== currId) {
          setHover(currId);
          this.ids.vector.prevHoverId = currId;
          onHover && onHover(properties);
        }
      },
      mouseout: (e: any) => {
        L.DomEvent.stopPropagation(e);
        const { setDefault } = this.LayerViewMethods(vectorGrid);
        if (
          !!this.ids.vector.prevHoverId &&
          this.ids.vector.prevClickId !== this.ids.vector.prevHoverId
        ) {
          setDefault(this.ids.vector.prevHoverId);
          this.ids.vector.prevHoverId = 0;
          onHover && onHover(initLayerProperties);
        }
      },
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        let properties: LayerProperties = initLayerProperties;
        if (e?.layer?.properties) properties = e.layer.properties;

        if (!properties?.['id']) return;
        const currId = properties['id'];

        const { setActive, setDefault } = this.LayerViewMethods(vectorGrid);

        if (!!currId && currId !== this.ids.vector.prevClickId) {
          if (this.mapData?.map && e?.latlng) {
            this.fitActiveVectorBounds(e.latlng, 'select');
          }
          setActive(currId);
          if (!!this.ids.vector.prevClickId)
            setDefault(this.ids.vector.prevClickId);
          onSelect && onSelect(properties);
        }
        if (currId === this.ids.vector.prevClickId) {
          setDefault(currId);
          this.ids.vector.prevClickId = 0;
          onReset && onReset(initLayerProperties);

          this.fitActiveVectorBounds(e.latlng, 'unselect');
          return;
        }

        this.ids.vector.prevClickId = currId;
      },
    });
  }

  private LayerViewMethods(vectorGrid: any) {
    return {
      setActive: (id: number) => {
        vectorGrid.setFeatureStyle(
          id,
          {
            color: 'white',
            fillOpacity: 0,
          },
          100
        );
      },
      setDefault: (id: number) => {
        vectorGrid.setFeatureStyle(
          id,
          this.getVectorStyles(this.getVectorUrls().layerName)[
            this.getVectorUrls().layerName
          ]
        );
      },
      setHover: (id: number) => {
        vectorGrid.setFeatureStyle(
          id,
          {
            color: 'white',
            fillOpacity: 0,
          },
          100
        );
      },
    };
  }

  private configurations() {
    (L.DomEvent as any).fakeStop = () => 0;
  }

  setDefaultContour() {
    if (!this.vectorGrid) return;
    this.layerService.selectProperties.subscribe((v) => {
      if (!v.id) {
        const { setDefault } = this.LayerViewMethods(this.vectorGrid);
        setDefault(this.ids.vector.prevClickId);
        this.ids.vector.prevClickId = 0;
      }
    });
  }

  private initVectorGridEvents() {
    this.vectorGridEvents(this.vectorGrid, {
      onSelect: (props) => {
        this.layerService.selectProperties.next(props);
      },
      onReset: (props) => {
        this.layerService.selectProperties.next(props);
      },
      onHover: (props) => {
        this.layerService.hoverProperites.next(props);
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
        this.mapService.vectorGridStatus.next('initialized');
      },
      onReset: () => {
        this.removeVectorTileLayer(map);
        this.mapService.vectorGridStatus.next('default');
      },
    });
  }
}
