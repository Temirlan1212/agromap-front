import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: true
})
export class DialogComponent {

  #open = false;
  @ViewChild('dialog') private dialog!: ElementRef<HTMLDialogElement>;
  @Input() header = '';
  @Input() subtitle = '';

  @Input() set open(v: boolean) {
    this.#open = v;
  }

  @Output() onClose = new EventEmitter<void>();

  get open(): boolean {
    return this.dialog?.nativeElement?.open ?? false;
  }

  constructor() {
  }

  ngAfterViewInit() {
    if (this.open && !this.#open) {
      this.close();
    } else if (!this.open && this.#open) {
      this.show();
    }
  }

  public close() {
    if (this.dialog?.nativeElement != null) {
      this.dialog.nativeElement.close();
      this.#open = false;
      this.onClose.next();
    }
  }

  public show() {
    if (this.dialog?.nativeElement != null) {
      this.dialog.nativeElement.showModal();
      this.#open = true;
    }
  }

  handleCloseClick() {
    this.close();
  }

  handleClose(event: Event) {
    this.onClose.next();
  }

  handleDialogClick(e: any) {
    if (e.target === this.dialog.nativeElement) {
      this.close();
    }
  }
}
