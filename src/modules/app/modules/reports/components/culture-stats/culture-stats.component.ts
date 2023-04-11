import {
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { LandTypeFormComponent } from '../report-form/report-form.component';
import { MessagesService } from 'src/modules/ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ITableField, ITableItem } from 'src/modules/ui/models/table.model';

@Component({
  selector: 'app-culture-stats',
  templateUrl: './culture-stats.component.html',
  styleUrls: ['./culture-stats.component.scss'],
})
export class CultureStatsComponent implements AfterViewInit {
  @ViewChild('form') form!: LandTypeFormComponent;
  loading: boolean = false;
  title: string = 'Square of cultures';

  data: ITableItem[] = [
    { name: 'John Doe', age: 25, city: 'New York' },
    { name: 'Jane Doe', age: 30, city: 'Los Angeles' },
    { name: 'Bob Smith', age: 40, city: 'Chicago' },
  ];

  columns: ITableField[] = [
    { title: 'Name', field: 'name' },
    { title: 'Age', field: 'age' },
    { title: 'City', field: 'city' },
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private cd: ChangeDetectorRef
  ) {}

  async handleButtonClick() {
    const formState = this.form.getState();
    const { value } = formState;

    if (!value.region || !value.land_type) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
  }

  handleExportAsPdfClick(): void {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.text(this.translate.transform(this.title), 14, 20);

    (doc as any).autoTable({
      head: [this.columns.map((column) => column.title)],
      body: this.data.map((row) =>
        this.columns.map((column) => (row as any)[column.field])
      ),
      startY: 30,
    });
    doc.save('export.pdf');
  }

  ngAfterViewInit(): void {
    this.handleButtonClick();
    this.cd.detectChanges();
  }
}
