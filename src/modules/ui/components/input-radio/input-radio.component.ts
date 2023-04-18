import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-radio.component.html',
  styleUrls: ['./input-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRadioComponent),
      multi: true,
    },
  ],
})
export class InputRadioComponent implements ControlValueAccessor {
  @Input() options: Record<string, any>[] = [];
  @Input() nameField: string = 'name';
  @Input() valueField: string = 'value';
  @Input() filterValue: string = 'value';
  @Input() name: string = '';
  @Input() value: string | number = '';
  @Input() disabled: boolean = false;
  @Output() changed = new EventEmitter<string | number>();
  @Input() isResettable: boolean = false;

  onChange: Function = () => null;
  onTouched: Function = () => null;

  constructor() {}

  handleClick(value: string | number): void {
    if (this.isResettable) {
      this.value = value;
    } else {
      this.value = this.value !== value ? value : '';
    }
    this.changed.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.value = value;
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
