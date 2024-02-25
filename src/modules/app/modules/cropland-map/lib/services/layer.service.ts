import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initLayerProperties } from '../_constants';
import { LayerPropertiesTypes } from '../_models';
import { SVGOverlay, GeoJSON, Tooltip } from 'leaflet';

type LayerInstances = {
  'splash-screen': SVGOverlay | null;
  'splash-screen-active-contour': GeoJSON<any, any> | null;
  'tooltip-on-hover': Tooltip | null;
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
    'tooltip-on-hover': null,
  };

  constructor() {}
}
