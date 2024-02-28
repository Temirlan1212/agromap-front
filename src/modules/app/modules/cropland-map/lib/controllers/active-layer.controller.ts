import { Injectable } from '@angular/core';
import { MapData } from 'src/modules/ui/models/map.model';
import { CroplandMainMapService } from '../services/map.service';
import { LTYPE_VALUES, initLayerProperties } from '../_constants';
import { CroplandMainLayerService } from '../services/layer.service';
import {
  buildSplashScreen,
  getCutlureColor,
  getPastureColor,
} from '../_helpers';
import { DomEvent, DomUtil, geoJSON, popup } from 'leaflet';
import { PBFConroller } from './pbf-controller';
import { ActiveLayerAttributes } from '../attributes/active-layer-attributes';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActiveLayerController {
  mapData: MapData | null = null;
  subs: Subscription[] = [];

  constructor(
    private mapService: CroplandMainMapService,
    private layerService: CroplandMainLayerService,
    private pbfConroller: PBFConroller,
    private router: Router,
    private _activeLayerAttributes: ActiveLayerAttributes
  ) {
    const sub = this.mapService.map.subscribe(
      async (mapData) => (this.mapData = mapData)
    );
    this.subs.push(sub);
  }

  createContent() {
    const content = DomUtil.create('div', 'content');
    const closeBtn = DomUtil.create('button', 'close-btn btn');
    const infoBtn = DomUtil.create(
      'button',
      'info-btn btn d-flex d-sm-none d-lg-none d-md-none d-xl-none'
    );
    const splitManBtn = DomUtil.create('button', 'split-map-btn btn');
    closeBtn.innerText = '✕';
    infoBtn.innerText = 'i';
    splitManBtn.innerHTML = `<svg id='icon' width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6 4C4.34315 4 3 5.34315 3 7V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V7C21 5.34315 19.6569 4 18 4H6ZM5 7C5 6.44772 5.44772 6 6 6H11V18H6C5.44772 18 5 17.5523 5 17V7ZM13 18H18C18.5523 18 19 17.5523 19 17V7C19 6.44772 18.5523 6 18 6H13V18Z" fill="currentColor"/>
    </svg>
    `;
    content.append(closeBtn);
    content.append(infoBtn);
    content.append(splitManBtn);
    return { content, closeBtn, infoBtn, splitManBtn };
  }

  createPopup(options: any, content: any, position: any) {
    this.layerService.layerInstances['active-layer-controller-popup'] = popup(
      options
    )
      .setContent(content)
      .setLatLng(position);
    return this.layerService.layerInstances['active-layer-controller-popup'];
  }

  createInfoPopup(content: any, position: any) {
    this.layerService.layerInstances['info-active-layer-popup'] = popup({
      closeButton: true,
      autoClose: true,
      pane: 'info-mobile-popup',
      maxWidth: 260,
      maxHeight: 230,
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

  bindInfoBtn(infoBtn: any, infoPopup: any) {
    const map = this.mapData?.map;
    DomEvent.addListener(infoBtn, 'click', (event: any) => {
      infoBtn.classList.add('hidden');
      if (map) map.openPopup(infoPopup);
    });
  }

  bindCloseBtn(closeBtn: any, layerService: any) {
    DomEvent.addListener(closeBtn, 'click', (event: any) => {
      layerService.selectProperties.next(initLayerProperties);
      this.pbfConroller.setDefaultContour();
      this.pbfConroller.setUnselectZoom();
      this.closeControllerPopup();
      this.layerService.selectProperties.next(initLayerProperties);
      this.removeSplashScreen();
      this.removeLayerHiglight();
      this.closeInfoPopup();
    });
  }

  bindSplitMapBtn(splitMap: any) {
    DomEvent.addListener(splitMap, 'click', (event: any) => {
      this.router.navigateByUrl('/cropland-map/split-map');
    });
  }

  addPopups(map: any, popup: any, infoPopup: any) {
    popup.addTo(map);
    // infoPopup.addTo(map);
  }

  bindMapZoom() {
    const sub = this.mapService.vectorGridStatus.subscribe((v) => {
      if (v === 'default') {
        this.closeControllerPopup();
        this.closeInfoPopup();
      }
    });
    this.subs.push(sub);
  }

  addListeners(infoBtn: any, closeBtn: any, infoPopup: any, splitManBtn: any) {
    this.bindInfoBtn(infoBtn, infoPopup);
    this.bindCloseBtn(closeBtn, this.layerService);
    this.bindSplitMapBtn(splitManBtn);
    this.bindMapZoom();
  }

  createLayerHiglight(polygon: any) {
    const map = this.mapData?.map;
    if (!map) return;
    map.createPane('active-layer-higlight').style.zIndex = '401';

    const culture = this.layerService.selectProperties.getValue().prd_clt_n;
    const prdvty = this.layerService.selectProperties.getValue().prdvty;
    const ltype = this.layerService.selectProperties.getValue().ltype;
    let fillColor = 'transparent';
    if (LTYPE_VALUES['CULTURE'] === ltype) {
      fillColor = getCutlureColor(culture as any);
    }
    if (LTYPE_VALUES['PASTURE'] === ltype) {
      const param = Number(prdvty);
      if (!isNaN(param)) fillColor = getPastureColor(param);
    }

    this.layerService.layerInstances['splash-screen-active-contour'] = geoJSON(
      polygon,
      {
        pane: 'active-layer-higlight',
        style: {
          color: 'white',
          fill: true,
          fillOpacity: 1,
          fillColor,
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

  closeControllerPopup() {
    const map = this.mapData?.map;
    if (!map) return;
    const instance =
      this.layerService.layerInstances['active-layer-controller-popup'];
    if (!instance) return;
    map.closePopup(instance);
    map.removeLayer(instance);
    this.layerService.layerInstances['active-layer-controller-popup'] = null;
  }

  createSplashScreen() {
    const map = this.mapData?.map;
    if (!map) return;
    this.layerService.layerInstances['splash-screen'] =
      buildSplashScreen().addTo(map);
  }

  createInfoPopupContent(activeContour: any): string {
    let htmlContent =
      '<div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">';
    this._activeLayerAttributes
      .attributes(activeContour)
      .forEach(({ label, value }) => {
        if (value() != null) {
          htmlContent += `<div style="font-size: 14px; display: flex; justify-content: space-between; gap: 10px"><strong>${label}:</strong> <span style="text-align: end">${value()}</span></div>`;
        }
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

    const { content, closeBtn, infoBtn, splitManBtn } = this.createContent();

    const popup = this.createPopup(
      {
        closeButton: false,
        className: 'active-layer-controller-popup',
        autoClose: false,
        closeOnClick: false,
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
    this.addListeners(infoBtn, closeBtn, infoPopup, splitManBtn);

    return popup;
  }
}
