import { Component, OnInit, ViewChild } from '@angular/core';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent implements OnInit {
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  sidePanelData: Record<string, any> = {};

  constructor() {}

  ngOnInit() {}

  handleSidePanelToggle(isOpened: boolean) {
    this.sidePanelData['state'] = !isOpened;
  }

  handleLinkClick() {
    this.toggleBtn.isContentToggled = false;
    this.sidePanelData['state'] = false;
  }
}
