import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'tooltip-component',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: true,
})
export class TooltipComponent implements AfterViewInit {
  @HostBinding('class')
  @Input()
  placement: 'top' | 'right' | 'bottom' | 'left' = 'right';
  @Input() top: string = '';

  element: HTMLElement;
  parentElement: HTMLElement | null;
  showTimeout?: number;
  componentRef: any;

  constructor(private elRef: ElementRef) {
    this.element = this.elRef.nativeElement;
    this.parentElement = this.element.parentElement;
  }

  ngAfterViewInit() {
    this.parentElement?.addEventListener('mouseenter', () => {
      this.closeTooltip();
      this.showTimeout = window.setTimeout(this.showTooltip.bind(this), 0);
    });

    this.parentElement?.addEventListener('mouseleave', () => {
      this.closeTooltip();
      window.clearInterval(this.showTimeout);
    });
  }

  closeTooltip() {
    const eRect = this.element.getBoundingClientRect();
    const pRect = this.parentElement?.getBoundingClientRect();
    const arrowSize = 8;

    let top = 0;
    let left = 0;

    if (pRect !== undefined && this.placement === 'top') {
      top = pRect.top - eRect.height - arrowSize - 20;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (pRect !== undefined && this.placement === 'right') {
      top = pRect.top + arrowSize - eRect.height / 8;
      left = pRect.right + arrowSize - 20;
    }

    if (pRect !== undefined && this.placement === 'bottom') {
      top = pRect.bottom + arrowSize + 20;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (pRect !== undefined && this.placement === 'left') {
      top = pRect.top + arrowSize - eRect.height / 2;
      left = pRect.left - eRect.width - arrowSize + 20;
    }

    this.element.style.top = `${top + +this.top}px`;
    this.element.style.left = `${left}px`;
    this.element.style.opacity = `0`;
  }

  showTooltip() {
    const eRect = this.element.getBoundingClientRect();
    const pRect = this.parentElement?.getBoundingClientRect();
    const arrowSize = 8;

    let top = 0;
    let left = 0;

    if (pRect !== undefined && this.placement === 'top') {
      top = pRect.top - eRect.height - arrowSize;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (pRect !== undefined && this.placement === 'right') {
      top = pRect.top + arrowSize - eRect.height / 8;
      left = pRect.right + arrowSize;
    }

    if (pRect !== undefined && this.placement === 'bottom') {
      top = pRect.bottom + arrowSize;
      left = pRect.left + pRect.width / 2 - eRect.width / 2;
    }

    if (pRect !== undefined && this.placement === 'left') {
      top = pRect.top + arrowSize - eRect.height / 2;
      left = pRect.left - eRect.width - arrowSize;
    }

    this.element.style.top = `${top + +this.top}px`;
    this.element.style.left = `${left}px`;
    this.element.style.opacity = `1`;
    this.element.style.transition = 'all 300ms';
  }
}
