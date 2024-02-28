import { Component, OnDestroy } from '@angular/core';
import { CroplandMainLayerService } from '../../lib/services/layer.service';
import { LayerProperties } from '../../lib/_models';
import { LTYPE_VALUES, initLayerProperties } from '../../lib/_constants';
import { Subscription } from 'rxjs';
import { ActiveLayerController } from '../../lib/controllers/active-layer.controller';
import { getCultureName } from '../../lib/_helpers';

@Component({
  selector: 'app-contour-hover-info',
  templateUrl: './contour-hover-info.component.html',
  styleUrls: ['./contour-hover-info.component.scss'],
})
export class ContourHoverInfoComponent implements OnDestroy {
  properties: LayerProperties = initLayerProperties;
  hidden = !this.properties.id;
  subs: Subscription[] = [];
  color = 'white';
  cultureName = '';

  constructor(
    private layerService: CroplandMainLayerService,
    private activeLayerController: ActiveLayerController
  ) {
    this.subs.push(
      this.layerService.hoverProperites.subscribe((value) => {
        if (!value) return;
        this.properties = value;
        this.hidden = !this.properties.id;
        this.color =
          this.activeLayerController.getActiveColor('hoverProperites');
        const { prd_clt_n, ltype } = this.properties;
        if (ltype === LTYPE_VALUES['PASTURE']) {
          this.cultureName = '';
          return;
        }
        if (ltype === LTYPE_VALUES['CULTURE']) {
          this.cultureName = getCultureName(prd_clt_n as any);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
