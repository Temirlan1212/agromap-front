import { Injectable } from '@angular/core';
import { MapData } from 'src/modules/ui/models/map.model';
import { CroplandMainMapService } from '../services/map.service';
import { initLayerProperties } from '../_constants';
import { CroplandMainLayerService } from '../services/layer.service';
import { buildSplashScreen } from '../_helpers';
import { DomEvent, DomUtil, geoJSON, popup } from 'leaflet';
import { PBFConroller } from './pbf-controller';
import { ActiveLayerAttributes } from '../attributes/active-layer-attributes';

@Injectable({ providedIn: 'root' })
export class ActiveLayerController {
  mapData: MapData | null = null;

  constructor(
    private mapService: CroplandMainMapService,
    private layerService: CroplandMainLayerService,
    private pbfConroller: PBFConroller,
    private _activeLayerAttributes: ActiveLayerAttributes
  ) {
    this.mapService.map.subscribe(async (mapData) => (this.mapData = mapData));
  }

  createContent() {
    const content = DomUtil.create('div', 'content');
    const closeBtn = DomUtil.create('button', 'close-btn btn');
    const infoBtn = DomUtil.create(
      'button',
      'info-btn btn d-flex d-sm-none d-lg-none d-md-none d-xl-none'
    );
    closeBtn.innerText = '✕';
    infoBtn.innerText = 'i';
    content.append(closeBtn);
    content.append(infoBtn);
    return { content, closeBtn, infoBtn };
  }

  createPopup(options: any, content: any, position: any) {
    return popup(options).setContent(content).setLatLng(position);
  }

  createInfoPopup(content: any, position: any) {
    this.layerService.layerInstances['info-active-layer-popup'] = popup({
      closeButton: true,
      autoClose: true,
      pane: 'info-mobile-popup',
    })
      .setContent(content)
      .setLatLng(position);
    return this.layerService.layerInstances['info-active-layer-popup'];
  }

  bindInfoPopup(infoPopup: any, infoBtn: any) {
    infoPopup.on({
      remove: () => {
        infoBtn.classList.remove('hidden');
      },
    });
  }

  toggleInfoBtn(infoPopup: any, infoBtn: any) {
    if (infoPopup.isOpen()) {
      infoBtn.classList.add('hidden');
    }
  }

  bindInfoBtn(infoBtn: any, map: any, infoPopup: any) {
    DomEvent.addListener(infoBtn, 'click', (event: any) => {
      infoBtn.classList.add('hidden');
      map.openPopup(infoPopup);
    });
  }

  bindCloseBtn(closeBtn: any, layerService: any) {
    DomEvent.addListener(closeBtn, 'click', (event: any) => {
      layerService.selectProperties.next(initLayerProperties);
      this.pbfConroller.setDefaultContour();
      this.pbfConroller.setUnselectZoom();
      this.pbfConroller.clearCloseButtonPopup();
      this.layerService.selectProperties.next(initLayerProperties);
      this.removeSplashScreen();
      this.removeLayerHiglight();
      this.closeInfoPopup();
    });
  }

  addPopups(map: any, popup: any, infoPopup: any) {
    popup.addTo(map);
    // infoPopup.addTo(map);
  }

  addListeners(infoBtn: any, closeBtn: any, map: any, infoPopup: any) {
    this.bindInfoBtn(infoBtn, map, infoPopup);
    this.bindCloseBtn(closeBtn, this.layerService);
  }

  addLayerInstances(popup: any, map: any) {
    this.layerService.layerInstances['close-active-layer-popup'] = popup;
  }

  createLayerHiglight(polygon: any) {
    const map = this.mapData?.map;
    if (!map) return;
    map.createPane('active-layer-higlight').style.zIndex = '401';
    this.layerService.layerInstances['splash-screen-active-contour'] = geoJSON(
      polygon,
      {
        pane: 'active-layer-higlight',
        style: {
          color: 'white',
          fill: true,
          fillOpacity: 1,
          fillColor: 'green',
        },
      }
    ).addTo(map);
  }

  removeLayerHiglight() {
    const map = this.mapData?.map;
    if (
      !map ||
      !this.layerService.layerInstances['splash-screen-active-contour']
    )
      return;
    map.removeLayer(
      this.layerService.layerInstances['splash-screen-active-contour']
    );
  }

  removeSplashScreen() {
    const map = this.mapData?.map;
    if (!map || !this.layerService.layerInstances['splash-screen']) return;
    map.removeLayer(this.layerService.layerInstances['splash-screen']);
  }

  closeInfoPopup() {
    const map = this.mapData?.map;
    if (!map) return;
    const instance =
      this.layerService.layerInstances['info-active-layer-popup'];
    if (!instance) return;
    map.closePopup(instance);
    this.layerService.layerInstances['info-active-layer-popup'] = null;
  }

  createSplashScreen() {
    const map = this.mapData?.map;
    if (!map) return;
    this.layerService.layerInstances['splash-screen'] =
      buildSplashScreen().addTo(map);
  }

  createInfoPopupContent(activeContour: any): string {
    let htmlContent =
      '<div style="max-height: 30vh; overflow: auto; display: flex; flex-direction: column; gap: 10px">';
    this._activeLayerAttributes
      .attributes(activeContour)
      .forEach(({ label, value }) => {
        htmlContent += `<div style="font-size: 14px;"><strong>${label}:</strong> ${value()}</div>`;
      });
    htmlContent += '</div>';
    return htmlContent;
  }

  initActiveLyaerControlls(activeContour: any) {
    const map = this.mapData?.map;
    if (!map) return;
    map.createPane('customPane').style.zIndex = '402';
    map.createPane('info-mobile-popup').style.zIndex = '10000';

    if (!this.layerService.layerInstances['splash-screen-active-contour'])
      return;

    const bounds =
      this.layerService.layerInstances[
        'splash-screen-active-contour'
      ].getBounds();
    const center = bounds.getNorthEast();

    const { content, closeBtn, infoBtn } = this.createContent();

    const popup = this.createPopup(
      {
        closeButton: false,
        className: 'close-active-layer-popup',
        autoClose: false,
      },
      content,
      center
    );

    const infoPopup = this.createInfoPopup(
      this.createInfoPopupContent(activeContour),
      bounds.getCenter()
    );
    this.bindInfoPopup(infoPopup, infoBtn);
    this.toggleInfoBtn(infoPopup, infoBtn);
    this.addPopups(map, popup, infoPopup);
    this.addListeners(infoBtn, closeBtn, map, infoPopup);
    this.addLayerInstances(popup, infoPopup);

    return popup;
  }
}
