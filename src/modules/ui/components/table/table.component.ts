import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionDialogComponent } from '../question-dialog/question-dialog.component';
import {
  ITableAction,
  ITableField,
  ITableItem,
} from '../../models/table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    QuestionDialogComponent,
    TranslateModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnChanges {
  @ViewChild('deleteDialog') deleteDialog!: QuestionDialogComponent;
  @Input() actions: boolean = false;
  @Input() fields: ITableField[] = [];
  @Input() items: ITableItem[] = [];
  @Output() actionClick = new EventEmitter<ITableAction>();

  columns: string[] = [];
  selectedAction: string | null = null;
  selectedItem: ITableItem | null = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] != null && this.items.length > 0) {
      this.columns = Object.keys(this.items[0]);
    }
  }

  handleActionClick(type: string, item: ITableItem) {
    this.selectedAction = type;
    this.selectedItem = item;

    if (type === 'delete') {
      this.deleteDialog.show();
    } else {
      this.actionClick.emit({ type: type, item });
    }
  }

  handleDeleteSubmitted(): void {
    if (this.selectedAction != null && this.selectedItem != null) {
      this.actionClick.emit({
        type: this.selectedAction,
        item: this.selectedItem,
      });
      this.selectedAction = null;
      this.selectedItem = null;
    }

    this.deleteDialog.close();
  }
}
