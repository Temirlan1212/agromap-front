import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component'

@Component({
  selector: 'app-map-control-split-map',
  templateUrl: './map-control-split-map.component.html',
  styleUrls: ['./map-control-split-map.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
  ],
})

export class MapControlSplitMap implements OnInit {
  @Input() isActive: boolean = false;
  constructor() {
  }

  ngOnInit() {
  }
}
