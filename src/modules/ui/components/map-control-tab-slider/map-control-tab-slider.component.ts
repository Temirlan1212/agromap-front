import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { FormatDatePipe } from '../../pipes/formatDate.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-map-control-tab-slider',
  templateUrl: './map-control-tab-slider.component.html',
  styleUrls: ['./map-control-tab-slider.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    FormatDatePipe,
    TranslateModule,
    LoadingComponent,
  ],
  providers: [FormatDatePipe],
})
export class MapControlTabSliderComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('timelineList') timelineListEl!: ElementRef<HTMLInputElement>;
  @ViewChild('timelineItem') timelineItemEl!: ElementRef<HTMLInputElement>;
  @ViewChild('timeline') timelineEl!: ElementRef<HTMLInputElement>;

  @Output() selectedDateOutput = new EventEmitter<string | null>();

  @Input() vegIndexesData: string[] = [];

  @Input() loading: boolean = false;
  @Input() isLayerChanged: boolean = false;

  selectedDate: string | null = null;
  currLang = this.translate.currentLang;
  translateSubscription!: Subscription;

  @Input('selectedDate') set selectedDateInput(date: string | null) {
    this.selectedDate = date;

    if (date) {
      for (const a in this.timelineListEl.nativeElement.children) {
        if (
          this.timelineListEl.nativeElement.children[a].textContent?.includes(
            `${this.formatDate.transform(date, 'fullDate', this.currLang)}`
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

  isActiveNextBtn = false;
  isActivePrevBtn = false;

  constructor(
    public translate: TranslateService,
    private formatDate: FormatDatePipe,
    private cd: ChangeDetectorRef
  ) {
    this.translateSubscription = translate.onLangChange.subscribe(
      () => (this.currLang = translate.currentLang)
    );
  }

  handleTimelineNextClick() {
    this.timelineListEl.nativeElement.scrollLeft += 350;
    this.toggleNextPrevBtns();
  }

  handleTimelinePrevClick() {
    this.timelineListEl.nativeElement.scrollLeft -= 350;
    this.toggleNextPrevBtns();
  }

  handleSelectDate(date: string) {
    this.selectedDateOutput.emit(date);
    this.selectedDate = date;
  }

  private toggleNextPrevBtns(): void {
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

  private checkIsTimelineListFull() {
    const clientWidthTList = this.timelineListEl?.nativeElement.clientWidth;
    const scrollWidthTList =
      this.timelineItemEl?.nativeElement.clientWidth *
      this.vegIndexesData.length;

    if (clientWidthTList && scrollWidthTList) {
      const lastElement = this.timelineListEl?.nativeElement.lastElementChild;
      lastElement && lastElement.scrollIntoView();

      if (scrollWidthTList < clientWidthTList) {
        this.isActiveNextBtn = false;
      }
    }
  }

  ngAfterViewInit() {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vegIndexesData'] && this.vegIndexesData.length !== 0) {
      this.cd.detectChanges();
      this.checkIsTimelineListFull();
    }
  }

  ngOnDestroy(): void {
    this.translateSubscription.unsubscribe();
  }
}
