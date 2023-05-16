import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
  imports: [SvgIconComponent, NgIf],
  standalone: true,
})
export class ToggleButtonComponent {
  @Input() iconName: string = '';
  @Input() iconSize: string = '16px';
  @Output() onClick = new EventEmitter<void>();
  @Input() isContentToggled: boolean = false;

  constructor() {}

  handleClick() {
    this.onClick.emit();
    this.isContentToggled = !this.isContentToggled;
  }
}
