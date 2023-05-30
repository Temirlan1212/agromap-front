import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subject, delay, filter, fromEvent, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class.active')
  isShow: boolean = false;

  @HostBinding('class')
  @Input()
  placement: 'top' | 'right' | 'bottom' | 'left' = 'left';

  @Input() delay: number = 300;

  element: HTMLElement;
  parentElement: HTMLElement | null;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private elementRef: ElementRef) {
    this.element = this.elementRef.nativeElement;
    this.parentElement = this.element.parentElement;
  }

  private adjustPlacement(
    eRect: DOMRect,
    pRect: DOMRect
  ): { top: number; left: number } {
    const arrowSize = 15;
    let top = 0;
    let left = 0;

    if (this.placement === 'top') {
      top = pRect.top - eRect.height - arrowSize;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (this.placement === 'right') {
      top = pRect.top + arrowSize - eRect.height / 2 + 7;
      left = pRect.right + arrowSize;
    }

    if (this.placement === 'bottom') {
      top = pRect.bottom + arrowSize;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (this.placement === 'left') {
      top = pRect.top + arrowSize - eRect.height / 2 + 7;
      left = pRect.left - eRect.width - arrowSize;
    }

    return { top, left };
  }

  private show() {
    const eRect = this.element.getBoundingClientRect();
    const pRect = this.parentElement?.getBoundingClientRect();

    if (pRect != undefined && !this.isShow) {
      const { left, top } = this.adjustPlacement(eRect, pRect);
      this.element.style.top = `${top}px`;
      this.element.style.left = `${left}px`;
      this.isShow = true;
    }
  }

  private hide() {
    this.isShow = false;
  }

  ngAfterViewInit() {
    if (this.parentElement) {
      const mouseenter = fromEvent(this.parentElement, 'mouseenter');
      const mouseleave = fromEvent(this.parentElement, 'mouseleave');

      mouseenter
        .pipe(
          delay(this.delay),
          takeUntil(this.destroy$),
          filter(() => !this.isShow)
        )
        .subscribe(this.show.bind(this));

      mouseleave
        .pipe(
          takeUntil(this.destroy$),
          filter(() => this.isShow)
        )
        .subscribe(this.hide.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }
}
