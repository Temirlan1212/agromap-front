import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/modules/api/api.service';
import { IUser } from '../../../api/models/user.model';
import { ToggleButtonComponent } from '../../../ui/components/toggle-button/toggle-button.component';
import { SidePanelComponent } from '../../../ui/components/side-panel/side-panel.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  @ViewChild('sidePanel') sidePanel!: SidePanelComponent;
  currentUser!: IUser | null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.api.user.getLoggedInUser();
  }

  async handleLogoutClick(): Promise<void> {
    await this.api.user.logOut();
    this.router.navigate(['']);
  }

  handleLinkClick(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
    this.sidePanel.handlePanelToggle();
    this.toggleBtn.isContentToggled = false;
  }
}
