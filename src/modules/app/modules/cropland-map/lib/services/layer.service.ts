import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initLayerProperties } from '../_constants';
import { LayerPropertiesTypes } from '../_models';

@Injectable({ providedIn: 'root' })
export class CroplandMainLayerService {
  layerProperties = new BehaviorSubject<Partial<LayerPropertiesTypes>>({
    selectProperties: initLayerProperties,
    hoverProperites: initLayerProperties,
  });

  constructor() {}
}
