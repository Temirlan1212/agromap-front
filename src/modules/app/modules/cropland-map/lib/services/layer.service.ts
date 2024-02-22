import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initLayerProperties } from '../_constants';
import { LayerPropertiesTypes } from '../_models';

@Injectable({ providedIn: 'root' })
export class CroplandMainLayerService {
  selectProperties = new BehaviorSubject<
    LayerPropertiesTypes['selectProperties']
  >(initLayerProperties);
  hoverProperites = new BehaviorSubject<
    LayerPropertiesTypes['hoverProperites']
  >(initLayerProperties);

  constructor() {}
}
