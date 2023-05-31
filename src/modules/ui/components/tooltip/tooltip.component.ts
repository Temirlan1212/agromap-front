import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: true,
})
export class TooltipComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class.visible')
  isShow = false;

  @HostBinding('class')
  @Input()
  placement: 'top' | 'right' | 'bottom' | 'left' = 'left';

  @HostBinding('style.width')
  @Input()
  width = '';

  @Input() delay = 0;

  destroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  private show() {
    const eRect = this.elementRef.nativeElement.getBoundingClientRect();
    const pRect =
      this.elementRef.nativeElement.parentElement?.getBoundingClientRect();

    if (pRect && !this.isShow) {
      this.isShow = true;
      const arrowSize = 15;
      let top = 0;
      let left = 0;

      switch (this.placement) {
        case 'top':
          top = pRect.top - eRect.height - arrowSize;
          left = pRect.left + pRect.width / 2 - eRect.width / 2;
          break;
        case 'right':
          top = pRect.top + arrowSize - eRect.height / 2 + 7;
          left = pRect.right + arrowSize;
          break;
        case 'bottom':
          top = pRect.bottom + arrowSize;
          left = pRect.left + pRect.width / 2 - eRect.width / 2;
          break;
        case 'left':
          top = pRect.top + arrowSize - eRect.height / 2 + 7;
          left = pRect.left - eRect.width - arrowSize;
          break;
      }

      this.elementRef.nativeElement.style.top = `${top}px`;
      this.elementRef.nativeElement.style.left = `${left}px`;
    }
  }

  private hide() {
    if (this.isShow) this.isShow = false;
  }

  ngAfterViewInit() {
    const parentElement = this.elementRef.nativeElement.parentElement;
    if (parentElement) {
      fromEvent(parentElement, 'mouseenter')
        .pipe(
          delay(this.delay),
          takeUntil(this.destroy$),
          filter(() => !this.isShow)
        )
        .subscribe(() => this.show());

      fromEvent(parentElement, 'mouseleave')
        .pipe(
          delay(this.delay),
          takeUntil(this.destroy$),
          filter(() => this.isShow)
        )
        .subscribe(() => this.hide());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }
}
