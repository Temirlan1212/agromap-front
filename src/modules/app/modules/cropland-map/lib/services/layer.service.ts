import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initLayerProperties } from '../_constants';
import { LayerPropertiesTypes } from '../_models';
import { SVGOverlay, GeoJSON, Popup } from 'leaflet';

type LayerInstances = {
  'splash-screen': SVGOverlay | null;
  'splash-screen-active-contour': GeoJSON<any, any> | null;
  'active-contour-hover-popup': Popup | null;
};

@Injectable({ providedIn: 'root' })
export class CroplandMainLayerService {
  selectProperties = new BehaviorSubject<
    LayerPropertiesTypes['selectProperties']
  >(initLayerProperties);
  hoverProperites = new BehaviorSubject<
    LayerPropertiesTypes['hoverProperites']
  >(initLayerProperties);

  layerInstances: LayerInstances = {
    'splash-screen': null,
    'splash-screen-active-contour': null,
    'active-contour-hover-popup': null,
  };

  constructor() {}
}
