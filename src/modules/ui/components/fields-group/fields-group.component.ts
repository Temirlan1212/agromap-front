import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-fields-group',
  standalone: true,
  host: { class: 'fields-group' },
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './fields-group.component.html',
  styleUrls: ['./fields-group.component.scss'],
})
export class FieldsGroupComponent {
  @Input() title: string = '';

  closed: boolean = false;

  constructor() {}

  handleButtonClick(): void {
    this.closed = !this.closed;
  }
}
