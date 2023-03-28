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
import { IDateLocal } from '../../models/date-picker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormatDatePipe } from '../../pipes/formatDate.pipe';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, SvgIconComponent, TranslateModule, FormatDatePipe],
})
export class DatePickerComponent implements OnInit {
  years: number[] = [];
  months: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  weeks: number[] = [0, 1, 2, 3, 4, 5, 6];

  @Output() selectedDateOutput = new EventEmitter<string | null>();

  filterDate: string[] = [];

  @Input('filterDate') set filterDateInput(filtereDate: string[]) {
    this.filterDate = filtereDate;
    this.renderCalendar();
  }

  @Input() selectedDate: string | null = null;

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

  constructor(public translate: TranslateService) {}

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

  ngOnInit(): void {
    this.renderCalendar();
    this.years = this.getYears(2015);
    this.toggleDisableArrowBtns();
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
    if (date.fullDate) {
      this.selectedDateOutput.emit(date.fullDate);
      this.selectedDate = date.fullDate;
    }
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

  private renderCalendar(): void {
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
      });
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
      const localDate = new Date(this.year, this.month, i + 1)
        .toISOString()
        .slice(0, 10);

      let includedDate: Record<string, string> = {};

      const isIncludes = this.filterDate
        .map((date) => {
          if (date === localDate) {
            includedDate[i] = date;
          }
          return date;
        })
        .includes(localDate);

      this.days.push({
        day: i,
        disabled: !isIncludes,
        isCurrentMonth: true,
        fullDate: new Date(this.year, this.month, i + 1)
          .toISOString()
          .slice(0, 10),
      });
    }

    for (let i = lastDayofMonth; i < 6; i++) {
      this.days.push({
        day: i - lastDayofMonth + 1,
        disabled: true,
      });
    }
  }

  private getYears(startYear: number) {
    var currentYear = new Date().getFullYear(),
      years = [];
    startYear = startYear || 1980;
    for (let i = startYear; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  }

  private toggleDisableArrowBtns() {
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
