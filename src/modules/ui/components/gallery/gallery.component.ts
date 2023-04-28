import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface IGalleryImage {
  alt: string;
  name: string;
  format: string;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class GalleryComponent {
  @Input() vertical: boolean = true;
  @Input() images: IGalleryImage[] = [
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },

    {
      alt: 'dd',
      name: '',
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
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },

    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
    {
      alt: 'dd',
      name: 'agromap-team-1',
      format: 'jpg',
    },
  ];

  activeImage: IGalleryImage = this.images[0];

  handleSelect(image: IGalleryImage) {
    this.activeImage = image;
  }
}
