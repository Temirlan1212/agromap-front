import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  standalone: true,
})
export class TabComponent {
  @Input() title!: string;
  active = false;
}
