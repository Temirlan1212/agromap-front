import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drop-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop-dialog.component.html',
  styleUrls: ['./drop-dialog.component.scss'],
})
export class DropDialogComponent implements AfterViewInit {
  @ViewChild('dialog') private dialog!: ElementRef<HTMLDialogElement>;
  @Input() target: HTMLElement | null = null;
  @Input() isHorizontal: boolean = false;
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() width: number = 200;
  @Input() height: number = 200;

  coords: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {}

  private close(): void {
    this.open = false;
    this.dialog.nativeElement.close();
  }

  private show(): void {
    this.open = true;
    this.dialog.nativeElement.show();
  }

  ngAfterViewInit(): void {
    if (this.target != null) {
      this.target.addEventListener('click', (event) => {
        this.toggle(event);
      });
    }
  }

  @HostListener('document:click', ['$event'])
  hideOnOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (target !== this.dialog.nativeElement) {
      this.close();
    }
  }

  private toggle(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;

    if (this.target != null && target !== this.dialog.nativeElement) {
      const rect = this.target.getBoundingClientRect();

      if (this.isHorizontal) {
        this.coords = { x: rect.right, y: rect.top };
        if (window.innerWidth - rect.right < this.width) {
          this.coords.x -= this.width + this.target.offsetWidth;
        }
        if (window.innerHeight - rect.bottom < this.height) {
          this.coords.y -= this.height - this.target.offsetHeight;
        }
      } else {
        this.coords = { x: rect.left, y: rect.bottom };
        if (window.innerWidth - rect.right < this.width) {
          this.coords.x -= this.width - this.target.offsetWidth;
        }
        if (window.innerHeight - rect.bottom < this.height) {
          this.coords.y -= this.height + this.target.offsetHeight;
        }
      }

      if (this.open) {
        this.close();
      } else {
        this.show();
      }
    }
  }
}
