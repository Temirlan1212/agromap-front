import { Component, HostBinding, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: true,
  imports: [NgIf]
})
export class LoadingComponent {
  @Input() loading: boolean = false;
  // мини спиннер используется в кнопках
  @HostBinding('class.mini')
  @Input() mini: boolean = false;

  @HostBinding('class.dynamic-color')
  @Input() dynamicColor: boolean = false;

  constructor() {
  }
}
