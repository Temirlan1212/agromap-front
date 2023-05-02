import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GalleryData } from '../../models/gallery.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class GalleryComponent implements OnInit {
  @ViewChild('mainImage') mainImage!: ElementRef;
  @Input() vertical: boolean = false;
  @Input() data: GalleryData[] = [];
  @Input() height: string = '';

  mainImageHeight: number = 0;
  activeData: GalleryData | null = null;

  constructor(translate: TranslateService) {}

  handleSelect(image: GalleryData) {
    this.activeData = image;
  }

  onMainImageLoad() {
    const mainImageHeight = this.mainImage.nativeElement.clientHeight;
    this.mainImageHeight = mainImageHeight;
  }

  ngOnInit(): void {
    this.activeData = this.data[0];
  }
}
