import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  standalone: true,
})
export class SidePanelComponent implements OnInit {
  @Input() isOpened: boolean = false;

  @HostBinding('class.isOpened')
  get isOpenedClass(): boolean {
    return this.isOpened;
  }

  constructor() {}

  ngOnInit() {}

  handlePanelToggle() {
    this.isOpened = !this.isOpened;
  }
}
