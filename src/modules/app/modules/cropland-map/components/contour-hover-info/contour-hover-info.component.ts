import { Component, OnDestroy } from '@angular/core';
import { CroplandMainLayerService } from '../../lib/services/layer.service';
import { LayerProperties } from '../../lib/_models';
import { initLayerProperties } from '../../lib/_constants';

@Component({
  selector: 'app-contour-hover-info',
  templateUrl: './contour-hover-info.component.html',
  styleUrls: ['./contour-hover-info.component.scss'],
})
export class ContourHoverInfoComponent implements OnDestroy {
  properties: LayerProperties = initLayerProperties;
  hidden = !this.properties.id;

  constructor(private layerService: CroplandMainLayerService) {
    this.layerService.hoverProperites.subscribe((value) => {
      // if (value) {
      //   this.properties = value;
      //   this.hidden = !this.properties.id;
      // }
    });
  }

  ngOnDestroy() {}
}
