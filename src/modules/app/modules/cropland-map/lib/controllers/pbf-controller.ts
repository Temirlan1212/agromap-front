import { Injectable } from '@angular/core';
import { MapData } from 'src/modules/ui/models/map.model';
import { CroplandMainMapService } from '../services/map.service';
import { Feature } from 'geojson';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';
import { LayerProperties } from '../_models';
import { initLayerProperties, storageNames } from '../_constants';
import { CroplandMainLayerService } from '../services/layer.service';
import { StoreService } from 'src/modules/ui/services/store.service';
import { buildSplashScreen } from '../_helpers';
import { TranslateService } from '@ngx-translate/core';

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
    vectorInitZoom: 12,
  };
  mapMoveMounted = false;

  constructor(
    private mapService: CroplandMainMapService,
    private layerService: CroplandMainLayerService,
    private storeService: StoreService,
    private translateService: TranslateService
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
        fillOpacity: 0,
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
    this.layerService.hoverProperites.next(initLayerProperties);
  }

  private mapEvents(map: MapData['map'], { onInit, onReset }: MapEvents) {
    let status: 'initialized' | 'default' = 'default';
    const zoom = map.getZoom();

    if (zoom >= this.zoom.vectorInitZoom && status === 'default') {
      onInit();
      status = 'initialized';
    }

    map.on({
      zoom: (e) => {
        const zoom = e.target._zoom;
        this.zoom.currentMapZoom = zoom;
        if (zoom >= this.zoom.vectorInitZoom && status === 'default') {
          onInit();
          status = 'initialized';
        }
        if (zoom < this.zoom.vectorInitZoom && status === 'initialized') {
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

  fitBounds(bounds: L.LatLngBounds) {
    const map = this.mapData?.map;
    if (!map) return;
    map.fitBounds(bounds, {
      maxZoom: this.zoom.layerSelectedMaxZoom,
    });
  }

  setUnselectZoom() {
    const map = this.mapData?.map;
    if (!map) return;
    const isResetable =
      this.zoom.currentMapZoom > this.zoom.layerUnselectedZoom;
    if (!isResetable) return;
    map.setZoom(this.zoom.layerUnselectedZoom);
  }

  private tooltipOnHover(latlng: L.LatLng, props: LayerProperties) {
    const currLang = this.translateService.currentLang;
    const translations = this.translateService.translations;
    const ha = translations?.[currLang]?.['ha'];
    if (this.mapData?.map) {
      this.layerService.layerInstances['tooltip-on-hover'] = L.tooltip({})
        .setContent(String(props.area) + ' ' + ha)
        .setLatLng(latlng)
        .addTo(this.mapData.map);
    }
  }

  private closeTooltipOnHover() {
    const instance = this.layerService.layerInstances['tooltip-on-hover'];
    const map = this.mapData?.map;
    if (map && instance) {
      map.closeTooltip(instance);
      this.layerService.layerInstances['tooltip-on-hover'] = null;
    }
  }

  private vectorGridEvents(
    vectorGrid: any,
    { onSelect, onReset, onHover }: Partial<VectorGridEvents>
  ) {
    vectorGrid.on({
      mouseover: (e: any) => {
        let properties: LayerProperties = initLayerProperties;
        if (e?.layer?.properties) properties = e.layer.properties;
        if (!properties?.['id']) return;
        const currId = properties['id'];
        const { setHover } = this.LayerViewMethods(vectorGrid);
        if (this.ids.vector.prevClickId !== currId) {
          setHover(currId);
          this.ids.vector.prevHoverId = currId;
          onHover && onHover(properties);
          if (!!this.ids.vector.prevClickId)
            this.tooltipOnHover(e.latlng, properties);
        }
      },
      mouseout: (e: any) => {
        const { setDefault } = this.LayerViewMethods(vectorGrid);
        if (
          !!this.ids.vector.prevHoverId &&
          this.ids.vector.prevClickId !== this.ids.vector.prevHoverId
        ) {
          setDefault(this.ids.vector.prevHoverId);
          this.ids.vector.prevHoverId = 0;
          onHover && onHover(initLayerProperties);
          if (!!this.ids.vector.prevClickId) this.closeTooltipOnHover();
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
          setActive(currId);
          if (!!this.ids.vector.prevClickId)
            setDefault(this.ids.vector.prevClickId);
          onSelect && onSelect(properties);
        }
        if (currId === this.ids.vector.prevClickId) {
          setDefault(currId);
          this.ids.vector.prevClickId = 0;
          onReset && onReset(initLayerProperties);
          this.setUnselectZoom();
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

  clearCloseButtonPopup() {
    const instance =
      this.layerService.layerInstances['close-active-layer-popup'];
    const map = this.mapData?.map;
    if (map && instance) {
      map.closePopup(instance);
      this.layerService.layerInstances['close-active-layer-popup'] = null;
    }
  }

  private configurations() {}

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

  persistMapView(zoom: number, bounds: L.LatLngBounds) {
    this.storeService.setItem<Record<string, typeof bounds | number>>(
      storageNames.croplandMapView,
      {
        bounds,
        zoom,
      }
    );
  }

  initPersistedMapView(map: MapData['map']) {
    const data = this.storeService.getItem(storageNames.croplandMapView);
    if (data !== null) {
      const bounds = L.latLngBounds(
        data.bounds._southWest,
        data.bounds._northEast
      );
      if (bounds) map.fitBounds(bounds);
    }
  }

  addSplashScreenOnActiveFeature(polygon: any) {
    const map = this.mapData?.map;
    if (!map) return;
    map.createPane('customPane').style.zIndex = '401';
    this.layerService.layerInstances['splash-screen-active-contour'] =
      L.geoJSON(polygon, {
        pane: 'customPane',
        style: {
          color: 'white',
          fill: true,
          fillOpacity: 1,
          fillColor: 'green',
        },
      }).addTo(map);

    const bounds =
      this.layerService.layerInstances[
        'splash-screen-active-contour'
      ].getBounds();

    // Calculate the center of the bounds
    const center = bounds.getNorthEast();

    var content = L.DomUtil.create('div', 'content');
    content.innerText = 'x';

    // Create a popup with your content
    const popup = L.popup({
      closeButton: false,
      className: 'close-active-layer-popup',
      autoClose: false,
    })
      .setContent(content)
      .setLatLng(center);

    L.DomEvent.addListener(content, 'click', (event) => {
      this.setDefaultContour();
      this.setUnselectZoom();
      this.resetSplashScreenOnActiveFeature();
      this.clearCloseButtonPopup();
      this.layerService.selectProperties.next(initLayerProperties);
    });

    popup.addTo(map);

    this.layerService.layerInstances['close-active-layer-popup'] = popup;

    this.layerService.layerInstances['splash-screen'] =
      buildSplashScreen().addTo(map);

    return popup;
  }

  resetSplashScreenOnActiveFeature() {
    const map = this.mapData?.map;
    if (
      !map ||
      !this.layerService.layerInstances['splash-screen-active-contour'] ||
      !this.layerService.layerInstances['splash-screen']
    )
      return;
    map.removeLayer(
      this.layerService.layerInstances['splash-screen-active-contour']
    );
    map.removeLayer(this.layerService.layerInstances['splash-screen']);
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
