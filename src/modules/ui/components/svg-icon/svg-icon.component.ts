import {
  Component,
  ElementRef,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
} from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
  standalone: true,
})
export class SvgIconComponent {
  @Input() name: string = '';
  @Input() size: string = '16px';

  differ: KeyValueDiffer<string, any>;

  constructor(
    private elementRef: ElementRef,
    private differs: KeyValueDiffers
  ) {
    this.setElementSizes();
    this.differ = this.differs.find({ size: this.size }).create();
  }

  ngDoCheck(): void {
    const changes = this.differ.diff({ size: this.size });
    if (changes !== null) {
      this.setElementSizes();
    }
  }

  private setElementSizes() {
    this.elementRef.nativeElement.style.width = this.size;
    this.elementRef.nativeElement.style.height = this.size;
  }
}
