import {
  AfterContentInit,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgForOf, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  standalone: true,
  imports: [SvgIconComponent, NgForOf, NgIf],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true,
    },
  ],
})
export class InputSelectComponent
  implements AfterContentInit, ControlValueAccessor, OnChanges
{
  onChange: Function = () => null;
  onTouched: Function = () => null;

  @Input() multi: boolean = false;
  @Input() placeholder: string = 'placeholder';

  @Input() items: Record<string, any>[] = [];
  @Input() selectedItems: Record<string, any>[] | null = [];

  @Input() idField: string = 'id';
  @Input() nameField: string = 'name';

  opened: boolean = false;
  selectedItemsObj: Record<string, any> = {};
  localItems: Record<string, any>[] = [];

  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit() {
    this.localItems = [...this.items];
    if (this.selectedItems == null) {
      this.selectedItems = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] != null) {
      this.localItems = [...this.items];
    }
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.opened = false;
    }
  }

  handleItemClick(e: Event, item: Record<string, any>) {
    if (this.multi) {
      this.handleMultiSelect(e, item);
    } else {
      this.handleSingleSelect(e, item);
    }
    this.onChange(
      this.selectedItems && this.selectedItems.length > 0
        ? this.selectedItems
        : null
    );
  }

  handleMultiSelect(e: Event, item: Record<string, any>) {
    if (!this.selectedItemsObj[item[this.idField]]) {
      this.selectedItems?.push(item);
      this.selectedItemsObj[item[this.idField]] = item[this.nameField];
    } else {
      this.handleRemoveItem(e, item);
      this.selectedItemsObj[item[this.idField]] = null;
    }
  }

  handleSingleSelect(e: Event, item: Record<string, any>) {
    if (!this.selectedItemsObj[item[this.idField]]) {
      this.selectedItems = [];
      this.selectedItemsObj = {};
      this.selectedItems.push(item);
      this.selectedItemsObj[item[this.idField]] = item[this.nameField];
    } else {
      this.handleRemoveItem(e, item);
      this.selectedItemsObj[item[this.idField]] = null;
    }
  }

  handleRemoveItem(e: Event, item: Record<string, any>) {
    e.preventDefault();
    e.stopPropagation();
    this.selectedItems =
      this.selectedItems &&
      this.selectedItems.filter((i) => i[this.idField] !== item[this.idField]);
    this.selectedItemsObj[item[this.idField]] = null;
    this.onChange(
      this.selectedItems && this.selectedItems.length > 0
        ? this.selectedItems
        : null
    );
  }

  handleSearch(search: string) {
    this.localItems = this.items.filter((i) =>
      i[this.nameField].toLowerCase().includes(search.toLowerCase())
    );
  }

  handleClearAll() {
    this.selectedItems = [];
    this.selectedItemsObj = {};
    this.onChange(null);
  }

  writeValue(obj: Record<string, any>[]): void {
    this.selectedItems = obj;
    for (const key in obj) {
      this.selectedItemsObj[obj[key][this.idField]] = obj[key][this.nameField];
    }
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }
}
