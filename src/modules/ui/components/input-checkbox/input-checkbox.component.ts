import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-input-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCheckboxComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, TranslateModule],
  standalone: true,
})
export class InputCheckboxComponent {
  @Input() name: string = '';
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Output() changed = new EventEmitter<boolean>();

  onChange: Function = () => null;
  onTouched: Function = () => null;

  constructor() {}

  handleClick(): void {
    this.checked = !this.checked;
    this.changed.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}
