import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
  imports: [CommonModule],
  standalone: true,
})
export class InputCheckboxComponent {
  @Input() name: string = '';
  @Input() value: string = '';
  @Input() selected: string = '';
  @Input() disabled: boolean = false;
  @Output() changed = new EventEmitter<Record<string, string>>();

  onChange: Function = () => null;
  onTouched: Function = () => null;

  constructor() {}

  handleClick(value: string): void {
    this.selected = this.selected !== value ? value : '';
    this.changed.emit({ checked: this.selected, name: value });
    this.onChange(this.selected);
    this.onTouched();
  }

  writeValue(value: string): void {
    this.selected = value;
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
