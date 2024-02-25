import { Component, OnDestroy } from '@angular/core';
import { CroplandMainLayerService } from '../../lib/services/layer.service';
import { LayerProperties } from '../../lib/_models';
import { initLayerProperties } from '../../lib/_constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contour-hover-info',
  templateUrl: './contour-hover-info.component.html',
  styleUrls: ['./contour-hover-info.component.scss'],
})
export class ContourHoverInfoComponent implements OnDestroy {
  properties: LayerProperties = initLayerProperties;
  hidden = !this.properties.id;
  subs: Subscription[] = [];

  constructor(private layerService: CroplandMainLayerService) {
    const sub1 = this.layerService.hoverProperites.subscribe((value) => {
      if (value) {
        this.properties = value;
        this.hidden = !this.properties.id;
      }
    });

    this.subs.push(...[sub1]);
  }

  ngOnDestroy() {
    this.subs.map((sub) => sub.unsubscribe());
  }
}
