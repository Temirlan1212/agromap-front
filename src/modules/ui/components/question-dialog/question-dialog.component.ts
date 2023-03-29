import { Component, ElementRef, Input, OnInit, ViewChild, HostBinding, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, SvgIconComponent],
})
export class QuestionDialogComponent implements OnInit {

  @ViewChild('dialog') private dialog!: ElementRef<any>;
  @Input() title = 'Подтвердить действие';
  @Input() submitText: string = 'Yes';
  @Input() cancelText: string = 'No';

  @HostBinding('class.info')
  @Input() isInfo: boolean = false;
  @HostBinding('class.danger')
  @Input() isDanger: boolean = false;
  @HostBinding('class.warning')
  @Input() isWarning: boolean = false;
  @HostBinding('class.success')
  @Input() isSuccess: boolean = false;

  @Output() submitted = new EventEmitter<boolean>();

  get open(): boolean {
    return (this.dialog?.nativeElement ?? { open: false }).open;
  }

  constructor() {
  }

  public close() {
    (this.dialog.nativeElement as any).close();
  }

  public show() {
    (this.dialog.nativeElement as any).showModal();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.dialog.nativeElement) {
      if (!this.dialog.nativeElement.showModal) {
        Object.defineProperty(this.dialog.nativeElement, "showModal", {
          value: () => {
            this.dialog.nativeElement.setAttribute('open', '');
          }
        });
      }

      if (!this.dialog.nativeElement.close) {
        Object.defineProperty(this.dialog.nativeElement, "close", {
          value: () => {
            this.dialog.nativeElement.removeAttribute('open');
          }
        });
      }
    }
  }

  handleCloseClick() {
    this.close();
  }

  handleSubmitClick() {
    this.submitted.emit(true);
  }
}
