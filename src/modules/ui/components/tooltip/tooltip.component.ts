import { Component, OnInit } from '@angular/core';
import { TooltipPosition } from './tooltip.enums';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements OnInit {
  tooltip: string = '';
  left: number = 0;
  top: number = 0;
  visible = false;
  position: TooltipPosition = TooltipPosition.DEFAULT;

  constructor() {}

  ngOnInit(): void {}
}
