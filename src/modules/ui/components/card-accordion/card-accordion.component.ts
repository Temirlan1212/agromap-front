import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-card-accordion',
  templateUrl: './card-accordion.component.html',
  styleUrls: ['./card-accordion.component.scss'],
  imports: [
    SvgIconComponent
  ],
  standalone: true
})
export class CardAccordionComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Input() title: string = 'Title';
  @Output() mouseClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();
  @Output() removeClick = new EventEmitter<void>();
  isOpened: boolean = false;

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.isOpened = false;

      if (this.dialog.nativeElement.open && target !== this.dialog.nativeElement){
        this.dialog.nativeElement.close();
      }
    }
  }

  @HostListener('click', ['$event'])
  hostClick(e:any) {
    if (this.dialog.nativeElement.open && !this.dialog.nativeElement.contains(e.target)){
      this.dialog.nativeElement.close();
    }else{
      this.isOpened = true;
      this.mouseClick.emit();
    }
  }

  handleCollapseClick(e: Event){
    e.stopPropagation();
    this.isOpened = !this.isOpened;
  }

  handleOptionsClick(e:Event){
    e.stopPropagation();
    this.dialog.nativeElement.show();
  }

  handleEditClick(e:Event){
    e.stopPropagation();
    this.editClick.emit();
  }

  handleRemoveClick(e:Event){
    e.stopPropagation();
    this.removeClick.emit();
  }

}
