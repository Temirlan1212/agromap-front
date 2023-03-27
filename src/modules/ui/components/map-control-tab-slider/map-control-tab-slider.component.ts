import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { IDate } from 'src/modules/api/models/veg-indexes.model';
import { MapLayerFeature } from '../../models/map.model';

@Component({
  selector: 'app-map-control-tab-slider',
  templateUrl: './map-control-tab-slider.component.html',
  styleUrls: ['./map-control-tab-slider.component.scss'],
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
})
export class MapControlTabSlider implements AfterViewInit {
  @ViewChild('timelineList') timelineListEl!: ElementRef<HTMLInputElement>;
  @ViewChild('timelineItem') timelineItemEl!: ElementRef<HTMLInputElement>;
  @ViewChild('timeline') timelineEl!: ElementRef<HTMLInputElement>;

  @Output() selectedDateOutput = new EventEmitter<IDate | null>();

  @Input() vegIndexesData: IDate[] = [];

  selectedDate: IDate | null = null;

  @Input('selectedDate') set selectedDateInput(value: IDate | null) {
    if (value) {
      this.selectedDate = value;

      for (const a in this.timelineListEl.nativeElement.children) {
        if (
          this.timelineListEl.nativeElement.children[a].textContent?.includes(
            value.formattedDate
          )
        ) {
          this.timelineListEl.nativeElement.children[a].scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center',
          });
        }
      }
    }
  }

  @Input() set isLayerChanged(value: boolean) {
    this.checkIsTimelineListFull();
  }

  isActiveNextBtn = false;
  isActivePrevBtn = false;

  constructor() {}

  handleTimelineNextClick() {
    this.timelineListEl.nativeElement.scrollLeft += 350;
    this.toggleNextPrevBtns();
  }

  handleTimelinePrevClick() {
    this.timelineListEl.nativeElement.scrollLeft -= 350;
    this.toggleNextPrevBtns();
  }

  handleSelectDate(date: IDate) {
    this.selectedDateOutput.emit(date);
    this.selectedDate = date;
  }

  toggleNextPrevBtns(): void {
    const timelineList = this.timelineListEl.nativeElement;
    if (timelineList.scrollLeft >= 40) {
      this.isActivePrevBtn = true;
    } else {
      this.isActivePrevBtn = false;
    }

    let maxScrollValue =
      timelineList.scrollWidth - timelineList.clientWidth - 60;

    if (timelineList.scrollLeft >= maxScrollValue) {
      this.isActiveNextBtn = false;
    } else {
      this.isActiveNextBtn = true;
    }
  }

  checkIsTimelineListFull() {
    const clientWidthTList = this.timelineListEl?.nativeElement.clientWidth;
    const scrollWidthTList =
      this.timelineItemEl?.nativeElement.clientWidth *
      this.vegIndexesData.length;

    if (clientWidthTList && scrollWidthTList) {
      setTimeout(() => {
        const lastElement = this.timelineListEl?.nativeElement.lastElementChild;
        lastElement && lastElement.scrollIntoView();

        if (scrollWidthTList > clientWidthTList) {
        } else {
          this.isActiveNextBtn = false;
        }
      }, 100);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.checkIsTimelineListFull();
    this.timelineListEl.nativeElement.addEventListener('scroll', () =>
      this.toggleNextPrevBtns()
    );

    this.timelineListEl.nativeElement.addEventListener(
      'wheel',
      (event: any) => {
        if (event.wheelDelta < 0) {
          this.handleTimelineNextClick();
        } else if (event.wheelDelta > 0) {
          this.handleTimelinePrevClick();
        }
      }
    );
  }
}
