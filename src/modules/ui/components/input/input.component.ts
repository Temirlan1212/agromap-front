import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgIf, NgStyle } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }]
})
export class InputComponent implements ControlValueAccessor{
  onChange: Function = () => null;
  onTouched: Function = () => null;
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  @Input() type: InputType = 'text';
  @Input() placeholder: string = 'Placeholder';
  @Input() leftIcon: string | null = null;
  @Input() rightIcon: string | null = 'user';
  @Input() value: string | null = null;

  handleRightIconClick(e:Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.rightIcon === 'clear' && this.inputElement.nativeElement.value != ''){
      this.inputElement.nativeElement.value = '';
    }
    return;
  }

  handleInputChange(e: KeyboardEvent){
    const inputValue = this.inputElement.nativeElement.value;
    this.value = (inputValue !== '') ? inputValue : null;
    this.onChange(this.value);
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

}
