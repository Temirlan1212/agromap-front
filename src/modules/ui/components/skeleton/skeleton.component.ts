import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  imports: [CommonModule],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() className = '';
  @Input() borderRadius = '4px';
}
