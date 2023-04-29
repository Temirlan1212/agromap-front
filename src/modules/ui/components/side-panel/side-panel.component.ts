import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  standalone: true,
})
export class SidePanelComponent implements OnInit {
  @HostBinding('class.isOpened') isOpened: boolean = false;

  constructor() {}

  ngOnInit() {}

  handlePanelToggle() {
    this.isOpened = !this.isOpened;
  }
}
