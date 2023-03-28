import {
  Component,
  ElementRef, EventEmitter,
  forwardRef, HostBinding,
  HostListener,
  Input,
  OnChanges, Output,
  SimpleChanges,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { NgForOf, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  standalone: true,
  imports: [SvgIconComponent, NgForOf, NgIf, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true,
    },
  ],
})
export class InputSelectComponent implements ControlValueAccessor, OnChanges {
  onChange: Function = () => null;
  onTouched: Function = () => null;

  @Input() multi: boolean = false;
  @Input() placeholder: string = 'placeholder';
  @HostBinding('class.disabled')
  isDisabled!: boolean;

  @Input() items: Record<string, any>[] = [];
  @Input() value: string | number | null = null;

  @Input() idField: string = 'id';
  @Input() nameField: string = 'name';
  @Output() onSelectItem = new EventEmitter<Record<string, any> | null>();

  opened: boolean = false;
  selectedItemsObj: Record<string, any> = {};
  selectedItems: Record<string, any>[] | null = [];
  localItems: Record<string, any>[] = [];

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] != null && Array.isArray(this.items)) {
      this.selectedItemsObj = {};
      this.localItems = [...this.items];
      let values = String(this.value);
      this.selectedItems = this.items.filter(i => values?.split(',').includes(String(i[this.idField])));
      this.value = !this.selectedItems.map(i => i[this.idField]).join(',') ? null : this.selectedItems.map(i => i[this.idField]).join(',');
      this.multi && this.onChange(this.value);
      this.selectedItems.forEach(i => this.selectedItemsObj[i[this.idField]] = i[this.nameField]);
    }
  }

  @HostListener('document:click', ['$event'])
  public onClick(e: any) {
    if (this.isDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
    const clickedInside = this.elementRef.nativeElement.contains(e.target);
    if (!clickedInside) {
      this.opened = false;
    }
  }

  handleItemClick(e: Event, item: Record<string, any>) {
    if (this.isDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.multi) {
      this.handleMultiSelect(e, item);
    } else {
      this.handleSingleSelect(e, item);
    }
    this.value = this.selectedItems?.map(i => i[this.idField]).join(',') as string;
    this.value = !this.multi ? Number(this.value) : this.value;
    this.onChange(
      this.selectedItems && this.selectedItems.length > 0
        ? this.value
        : null
    );
    this.onTouched();
  }

  handleMultiSelect(e: Event, item: Record<string, any>) {
    if (!this.selectedItemsObj[item[this.idField]]) {
      this.selectedItems?.push(item);
      this.selectedItemsObj[item[this.idField]] = item[this.idField];
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
      this.selectedItemsObj[item[this.idField]] = item[this.idField];
      this.onSelectItem.emit(item);
    } else {
      this.handleRemoveItem(e, item);
      this.selectedItemsObj[item[this.idField]] = null;
      this.onSelectItem.emit(null);
    }
  }

  handleRemoveItem(e: Event, item: Record<string, any>) {
    if (!this.isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      this.selectedItems =
        this.selectedItems &&
        this.selectedItems.filter((i) => i[this.idField] !== item[this.idField]);
      this.selectedItemsObj[item[this.idField]] = null;
      this.value = this.selectedItems?.map(i => i[this.idField]).join(',') as string;
      this.value = !this.multi ? Number(this.value) : this.value;
      this.onChange(
        this.selectedItems && this.selectedItems.length > 0
          ? this.value
          : null
      );
      this.onSelectItem.emit(null);
    }
    return;
  }

  handleSelectToggle(e: MouseEvent) {
    if (this.isDisabled) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      this.opened = !this.opened;
    }
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

  writeValue(obj: string | number): void {
    this.value = obj;
    if (obj == null) {
      this.selectedItemsObj = {};
    }
    this.selectedItems = this.items.filter(i => i[this.idField] === this.value);
    this.selectedItems.forEach(i => this.selectedItemsObj[i[this.idField]] = i[this.nameField]);
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}
