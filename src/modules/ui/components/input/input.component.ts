import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgIf, NgStyle } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'number' | 'password' | 'email' | 'tel';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [SvgIconComponent, NgIf, NgStyle],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnChanges {
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  @Input() type: InputType = 'text';
  @Input() pattern: string | null = null;
  @Input() placeholder: string = 'Placeholder';
  @Input() leftIcon: string | null = null;
  @Input() rightIcon: string | null = 'clear';
  @Input() value: string | null = null;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Output() leftIconClick = new EventEmitter<void>();
  @Output() validity = new EventEmitter<boolean>();

  onChange: Function = () => null;
  onTouched: Function = () => null;

  handleRightIconClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (
      this.rightIcon === 'clear' &&
      this.inputElement.nativeElement.value != ''
    ) {
      this.inputElement.nativeElement.value = '';
      this.value = null;
      this.onChange(this.value);
    }
    return;
  }

  handleLeftIconClick() {
    this.leftIconClick.emit();
  }

  handleInputChange(e: Event) {
    const inputValue = this.inputElement.nativeElement.value;

    if (inputValue !== '') {
      this.value = inputValue;
    } else {
      this.value = null;
    }

    this.validity.emit(this.inputElement.nativeElement.checkValidity());
    this.onChange(this.value);
    this.onTouched();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] != null && this.pattern == null) {
      switch (changes['type'].currentValue) {
        case 'email':
          this.pattern = '^[\\w.-]+@[\\w.-]+\\.[\\w]{2,4}$';
          break;
        case 'number':
          this.pattern = '^[0-9.,]+$';
          break;
        case 'password':
          this.pattern = '^[^\\s]{4,}$';
          break;
        case 'tel':
          this.pattern = '^996[0-9]{9,9}$';
          break;
        case 'text':
        default:
      }
    }
  }

  writeValue(obj: string): void {
    this.value = obj;
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
