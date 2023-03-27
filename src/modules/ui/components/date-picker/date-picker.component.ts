import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { IDate } from 'src/modules/api/models/veg-indexes.model';

interface IDateLocal {
  day: number | string;
  disabled: boolean;
  isCurrentMonth: boolean;
  fullDate: string;
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
})
export class DatePickerComponent implements OnInit {
  years: number[] = [];
  weeks: string[] = ["ВС", "ПН", "ВТ", "СР", "ЧВ", "ПТ", "СБ"];

  @Output() filteredDaysOutput = new EventEmitter<IDateLocal[]>();
  @Output() selectedDateOutput = new EventEmitter<IDate | null>();

  @Input() months: string[] = [];
  filterDate: IDate[] = [];

  @Input('filterDate') set filterDateInput(filtereDate: IDate[]) {
    this.filterDate = filtereDate;
    this.renderCalendar();
  }

  @Input() selectedDate: IDate | null = null;

  days: IDateLocal[] = [];
  date = new Date();
  year = this.date.getFullYear();
  month = this.date.getMonth();

  currDate = new Date().toISOString().slice(0, 10);
  currYear = new Date().getFullYear();
  currMonth = new Date().getMonth();

  isCurrYCollapsed = false;
  isCurrMCollapsed = false;

  isNextBtnDisabled = false;
  isPrevBtnDisabled = false;

  constructor() {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const targetElClassName = target.className;
    const isDialogClickOutside = targetElClassName !== 'dialog-item';

    if (isDialogClickOutside && targetElClassName !== 'year') {
      this.isCurrYCollapsed = false;
    }
    if (isDialogClickOutside && targetElClassName !== 'month') {
      this.isCurrMCollapsed = false;
    }
  }

  renderCalendar(): void {
    this.days = [];
    let firstDayofMonth = new Date(this.year, this.month, 1).getDay(), // getting first day of month
      lastDateofMonth = new Date(this.year, this.month + 1, 0).getDate(), // getting last date of month
      lastDayofMonth = new Date(
        this.year,
        this.month,
        lastDateofMonth
      ).getDay(),
      lastDateofLastMonth = new Date(this.year, this.month, 0).getDate(); // getting last date of previous month

    for (let i = firstDayofMonth; i > 0; i--) {
      this.days.push({
        day: lastDateofLastMonth - i,
        disabled: true,
        isCurrentMonth: false,
        fullDate: new Date(this.year, this.month, lastDateofLastMonth - i + 1)
          .toISOString()
          .slice(0, 10),
      });
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
      const localDate = new Date(this.year, this.month, i + 1)
        .toISOString()
        .slice(0, 10);

      let includedDate: Record<string, string> = {};

      const isIncludes = this.filterDate
        .map((date) => {
          if (date.date.split('|')[0] === localDate) {
            includedDate[i] = date.date;
          }
          return date.date.split('|')[0];
        })
        .includes(localDate);

      this.days.push({
        day: i,
        disabled: !isIncludes,
        isCurrentMonth: true,
        fullDate: includedDate[i],
      });
    }

    for (let i = lastDayofMonth; i < 6; i++) {
      this.days.push({
        day: i - lastDayofMonth + 1,
        disabled: true,
        isCurrentMonth: false,
        fullDate: new Date(this.year, this.month, i - lastDayofMonth + 1)
          .toISOString()
          .slice(0, 10),
      });
    }
  }

  ngOnInit(): void {
    this.renderCalendar();
    this.years = this.getYears(2015);
    this.toggleDisableArrowBtns();
    this.filteredDaysOutput.emit(this.days);
  }

  handleNextPrevClick(type: string) {
    this.month = type === 'prev' ? this.month - 1 : this.month + 1;

    if (this.month < 0 || this.month > 11) {
      this.date = new Date(this.year, this.month, new Date().getDate());
      this.year = this.date.getFullYear(); // updating current year with new this.date year
      this.month = this.date.getMonth(); // updating current month with new this.date month
    } else {
      this.date = new Date(); // pass the current date as date value
    }
    this.renderCalendar(); // calling renderCalendar function
    this.toggleDisableArrowBtns();
  }

  handleSelectDateClick(date: IDateLocal) {
    let formattedDate = `${date.fullDate.split('-')[0]} ${
      this.months[+date.fullDate.split('-')[1] - 1]
    } ${date.fullDate.split('-')[2]}`;

    this.selectedDateOutput.emit({
      date: date.fullDate,
      formattedDate: formattedDate.split('|')[0],
    });

    this.selectedDate = {
      date: date.fullDate,
      formattedDate: formattedDate.split('|')[0],
    };
  }

  handleSelectYearClick(year: number) {
    this.year = year;
    this.date = new Date(this.year, this.month, new Date().getDate());
    this.renderCalendar();
    this.isCurrYCollapsed = false;
    this.toggleDisableArrowBtns();
  }

  handleSelectMonthClick(index: number) {
    this.month = index;
    this.renderCalendar();
    this.isCurrMCollapsed = false;
    this.toggleDisableArrowBtns();
  }

  handleResetToCurrentDateClick() {
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth();
    this.date = new Date(this.year, this.month, new Date().getDate());

    this.renderCalendar();
    this.toggleDisableArrowBtns();
  }

  handleCollapseClick(type: string) {
    if (type === 'year') this.isCurrYCollapsed = !this.isCurrYCollapsed;
    if (type === 'month') this.isCurrMCollapsed = !this.isCurrMCollapsed;
  }

  getYears(startYear: number) {
    var currentYear = new Date().getFullYear(),
      years = [];
    startYear = startYear || 1980;
    for (let i = startYear; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  }

  toggleDisableArrowBtns() {
    const isDisabledPrevBtn =
      `${this.year}-${this.month}` === `${this.years[0]}-0`;

    if (isDisabledPrevBtn) {
      this.isPrevBtnDisabled = true;
    } else {
      this.isPrevBtnDisabled = false;
    }

    const isDisabledNextBtn =
      `${this.year}-${this.month}` ===
      `${this.years[this.years.length - 1]}-${new Date().getMonth()}`;

    if (isDisabledNextBtn) {
      this.isNextBtnDisabled = true;
    } else {
      this.isNextBtnDisabled = false;
    }
  }
}
