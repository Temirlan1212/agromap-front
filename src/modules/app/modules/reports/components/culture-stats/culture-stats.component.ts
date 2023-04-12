import {
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { LandTypeFormComponent } from '../report-form/report-form.component';
import { MessagesService } from 'src/modules/ui/components/services/messages.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import { ITableItem } from 'src/modules/ui/models/table.model';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
import { TableComponent } from 'src/modules/ui/components/table/table.component';

@Component({
  selector: 'app-culture-stats',
  templateUrl: './culture-stats.component.html',
  styleUrls: ['./culture-stats.component.scss'],
})
export class CultureStatsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('form') form!: LandTypeFormComponent;
  @ViewChild('table') table!: TableComponent;
  loading: boolean = false;
  title: string = 'Square of cultures';

  data: ITableItem[] = [];

  currLang: string = this.translateSvc.currentLang;

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe((lang) => {
      this.currLang = lang.lang;

      this.data = this.data.map((res) => {
        const area_ha = String(res['area_ha']);
        return {
          ...res,
          area_ha: `${area_ha.slice(0, -2)}${
            this.translateSvc.translations[this.currLang]['ha']
          }`,
        };
      });
    }),
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private cd: ChangeDetectorRef,
    private translateSvc: TranslateService
  ) {}

  async handleButtonClick() {
    const formState = this.form.getState();
    const { value } = formState;

    if (!value.land_type) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    this.loading = true;
    try {
      const res = await this.api.statistics.getCultureStatistics(value);
      this.data = res.map((res) => {
        return {
          ...res,
          area_ha: `${res['area_ha']} ${
            this.translateSvc.translations[this.currLang]['ha']
          }`,
        };
      });
    } catch (error: any) {
      this.messages.error(this.translate.transform(error.message));
    }
    this.loading = false;
  }

  handleExportAsPdfClick(): void {
    if (this.table.table.nativeElement) {
      const doc = new jsPDF('p', 'mm', 'a4');
      html2canvas(this.table.table.nativeElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 size
        const pageHeight = 297; // A4 size
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        doc.save('export.pdf');
      });
    }
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
