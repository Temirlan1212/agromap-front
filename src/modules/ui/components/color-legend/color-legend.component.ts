import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-color-legend',
  templateUrl: './color-legend.component.html',
  styleUrls: ['./color-legend.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ColorLegendComponent {
  @Input() items: Record<string, any>[] = [];
  @Input() labelField: string = 'label';
  @Input() colorField: string = 'color';
  @Input() maxHeight: string = 'auto';
}
