import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-slider',
  templateUrl: './input-slider.component.html',
  styleUrls: ['./input-slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSliderComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class InputSliderComponent implements ControlValueAccessor, OnInit {
  @Input() value: number = 1;
  @Input() disabled: boolean = false;
  @Input() max: number = 50;
  @Input() min: number = 0;
  @Input() step: number = 1;
  @Input() height: number = 0.1;

  onChange: Function = () => null;
  onTouched: Function = () => null;

  onSliderChange(e: Event): void {
    const value = (e.target as any).value;
    this.value = value;
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

  ngOnInit(): void {
    this.onChange(3);
  }
}
