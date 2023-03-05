import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRoutes } from '../../models/routes.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  host: { class: 'sidenav' },
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  @Input() isContentFull: boolean = true;
  @Input() logoTitle: string = '';
  @Input() topRoutes: IRoutes[] = [];
  @Input() bottomRoutes: IRoutes[] = [];

  opened: boolean = false;

  constructor() {}
}
