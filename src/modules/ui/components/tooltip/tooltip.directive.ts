import {
  Directive,
  Input,
  ComponentRef,
  ElementRef,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  HostListener,
  EmbeddedViewRef,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { TooltipPosition } from './tooltip.enums';

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective {
  @Input() tooltip = '';
  @Input() showDelay: any = 0;
  @Input() position: any = TooltipPosition.DEFAULT;

  private componentRef!: ComponentRef<any> | null;
  private showTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.componentRef) {
      console.log(this.componentRef);
      const componentFactory =
        this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);
      this.componentRef = componentFactory.create(this.injector);
      this.appRef.attachView(this.componentRef.hostView);
      const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;

      document.body.appendChild(domElem);
      this.setTooltipComponentProperties();
      this.showTimeout = window.setTimeout(
        this.showTooltip.bind(this),
        this.showDelay
      );
    }
  }

  private setTooltipComponentProperties() {
    if (this.componentRef !== null) {
      this.componentRef.instance.tooltip = this.tooltip;
      this.componentRef.instance.position = this.position;

      const { left, right, top, bottom } =
        this.elementRef.nativeElement.getBoundingClientRect();

      switch (this.position) {
        case TooltipPosition.BELOW: {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(bottom + 20);
          break;
        }
        case TooltipPosition.ABOVE: {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(top - 40);
          break;
        }
        case TooltipPosition.RIGHT: {
          this.componentRef.instance.left = Math.round(right - 20);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        case TooltipPosition.LEFT: {
          this.componentRef.instance.left = Math.round(left - 40);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  private showTooltip() {
    if (this.componentRef !== null) {
      this.componentRef.instance.visible = true;
      this.componentRef.instance.position = this.position;

      const { left, right, top, bottom } =
        this.elementRef.nativeElement.getBoundingClientRect();

      switch (this.position) {
        case TooltipPosition.BELOW: {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(bottom + 10);
          break;
        }
        case TooltipPosition.ABOVE: {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(top - 20);
          break;
        }
        case TooltipPosition.RIGHT: {
          this.componentRef.instance.left = Math.round(right + 5);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        case TooltipPosition.LEFT: {
          this.componentRef.instance.left = Math.round(left - 25);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.componentRef !== null) {
      window.clearInterval(this.showTimeout);
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
