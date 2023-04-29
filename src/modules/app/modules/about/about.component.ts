import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GalleryData } from 'src/modules/ui/models/gallery.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  moTechnologiesActiveImgName: string = 'plants_humidity';
  informationalSystemGalleryItems: GalleryData[] = [
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-2',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-3',
      format: 'jpg',
    },
  ];

  moTechnologiesGalleryItems: GalleryData[] = [
    {
      alt: 'dd',
      name: 'plants_humidity',
      format: 'png',
      text: 'mo-technologies__list-item-1',
    },
    {
      alt: 'dd',
      name: 'agromap_fields',
      format: 'png',
      text: 'mo-technologies__list-item-2',
    },
    {
      alt: 'dd',
      name: 'cultures',
      format: 'png',
      text: 'mo-technologies__list-item-3',
    },
    {
      alt: 'dd',
      name: 'prediction_productivity',
      format: 'png',
      text: 'mo-technologies__list-item-4',
    },
  ];

  constructor(private translate: TranslatePipe) {}

  handleMousemove(imgName: string) {
    this.moTechnologiesActiveImgName = imgName;
  }
}
