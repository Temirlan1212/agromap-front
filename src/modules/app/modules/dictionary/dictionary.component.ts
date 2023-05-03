import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent implements OnInit {
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  @ViewChild('sidePanel') sidePanel!: SidePanelComponent;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  handleLinkClick() {
    this.sidePanel.handlePanelToggle();
    this.toggleBtn.isContentToggled = false;
  }
}
