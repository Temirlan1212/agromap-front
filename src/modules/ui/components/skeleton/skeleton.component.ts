import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() className = '';
  @Input() borderRadius = '4px';
}
