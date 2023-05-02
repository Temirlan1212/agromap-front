import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
})
export class PaginatorComponent {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() pageLinksQuantity: number = 6;
  @Input() showPrevNextButtons: boolean = true;
  @Input() position: string = 'start' || 'center' || 'end';

  @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();

  pages: number[] = [];
  totalPages: number = 0;

  ngOnChanges() {
    this.calculatePages();
  }

  goToPage(page: number) {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.onPageChange.emit(page);
      this.calculatePages();
    }
  }

  changeItemsPerPage(item: Record<string, any> | null) {
    this.itemsPerPage = item?.['id'] as number;
    this.calculatePages();
  }

  private calculatePages() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    const visiblePages: number[] = [];

    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(this.pageLinksQuantity / 2)
    );
    let endPage = Math.min(
      this.totalPages,
      this.currentPage + Math.floor(this.pageLinksQuantity / 2)
    );

    if (endPage - startPage < this.pageLinksQuantity - 1) {
      if (this.currentPage < this.totalPages / 2) {
        endPage = Math.min(
          this.totalPages,
          endPage + (this.pageLinksQuantity - (endPage - startPage + 1))
        );
      } else {
        startPage = Math.max(
          1,
          startPage - (this.pageLinksQuantity - (endPage - startPage + 1))
        );
      }
    }

    for (let i = startPage + 1; i <= endPage - 1; i++) {
      visiblePages.push(i);
    }
    this.pages = visiblePages;
  }
}
