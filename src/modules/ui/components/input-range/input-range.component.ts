import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-range',
  templateUrl: './input-range.component.html',
  styleUrls: ['./input-range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRangeComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class InputRangeComponent implements ControlValueAccessor {
  @Input() value: number = 1;
  @Input() disabled: boolean = false;
  @Input() max: number = 50;
  @Input() min: number = 0;
  @Input() step: number = 1;
  @Input() name: string = 'name';
  @Input() height: number = 0.1;

  @Output() change = new EventEmitter<number>();

  onChange: Function = () => null;
  onTouched: Function = () => null;

  handleChange(e: Event): void {
    const value = (e.target as any).value;
    this.value = this.value;
    this.change.emit(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: number): void {
    this.value = value;
    this.onChange(value);
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
