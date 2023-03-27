import { Component, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component'

@Component({
  selector: 'app-map-control-zoom',
  templateUrl: './map-control-zoom.component.html',
  styleUrls: ['./map-control-zoom.component.scss'],
  standalone: true,
  imports: [
    SvgIconComponent,
  ],
})

export class MapControlZoomComponent implements OnInit {
  @Input() map!: L.Map;

  isZoomInControlDisabled = false;
  isZoomOutControlDisabled = false;
  
  zoomLevel = 0;
  minZoom = 0;
  maxZoom = 0;

  constructor() {
  }

  handleZoomInClick() {
    this.zoomLevel = this.map.getZoom();
    this.map.setZoom(this.zoomLevel + 1);
  }

  handleZoomOutClick() {
    this.zoomLevel = this.map.getZoom();
    this.map.setZoom(this.zoomLevel - 1);
  }

  checkIsDisabledZoomControls() {
    this.isZoomInControlDisabled = this.zoomLevel >= this.maxZoom;
    this.isZoomOutControlDisabled = this.zoomLevel <= this.minZoom;
  }

  ngOnInit() {
    this.maxZoom = this.map.getMaxZoom();
    this.minZoom = this.map.getMinZoom();
    this.checkIsDisabledZoomControls()
   
    this.map.on("zoom", () => {
      this.zoomLevel = this.map.getZoom();
      this.checkIsDisabledZoomControls()
    })
  }
}
