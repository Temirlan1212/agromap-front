import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component'
import * as L from 'leaflet';
import "leaflet.locatecontrol"

@Component({
  selector: 'app-map-control-locate',
  templateUrl: './map-control-locate.component.html',
  styleUrls: ['./map-control-locate.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
  ],
})

export class MapControlLocate implements OnInit {
  @Input() map!: L.Map;

  isLocateControlActive = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  handleLocateClick(): void | boolean {
    let element = this.document.querySelector('.leaflet-control-locate a') as HTMLDivElement;
    
    if(this.isLocateControlActive) {
      this.map.setView(new L.LatLng(41.84, 75.06), 7.3)
    } 

    this.simulateClick(element);

    this.isLocateControlActive = !this.isLocateControlActive;
  }

  simulateClick = function (elem: HTMLDivElement) {
    var evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    !elem.dispatchEvent(evt);
  };

  ngOnInit() {
    L.control.locate({
      position: "bottomright",
      showPopup: true,
    })
    .addTo(this.map);

    let element = this.document.querySelector('.leaflet-control-locate') as HTMLDivElement;
    element.style.display = "none"
  }
}
