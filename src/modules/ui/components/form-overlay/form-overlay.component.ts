import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-overlay',
  templateUrl: './form-overlay.component.html',
  styleUrls: ['./form-overlay.component.scss'],
  imports: [TranslateModule],
  standalone: true,
})
export class FormOverlayComponent {
  @Input() title: string = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  constructor() {}

  handleCancelClick() {
    this.cancel.emit();
  }

  handleSaveClick() {
    this.save.emit();
  }
}
