import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgIf, NgStyle } from '@angular/common';

export type InputType = 'text' | 'number' | 'password' | 'email';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [
    SvgIconComponent,
    NgIf,
    NgStyle
  ],
  standalone: true
})
export class InputComponent {
  @Input() type: InputType = 'text';
  @Input() placeholder: string = 'Placeholder';
  @Input() leftIcon: string | null = null;
  @Input() rightIcon: string | null = 'user';

  handleRightIconClick(e:Event) {
    e.preventDefault();
    e.stopPropagation();


  }

}
