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
import { FormControl } from '@angular/forms';

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
  territory: string = '';

  data: ITableItem[] = [];

  currLang: string = this.translateSvc.currentLang;

  mode: FormControl = new FormControl<string | null>(null);

  aiBaseRadioOptions: any = [
    { name: 'AI', value: 'agromap_store_ai' },
    { name: 'Base', value: 'agromap_store' },
  ];

  columns = [
    {
      title: this.translate.transform('Name'),
      field: 'culture_name_' + this.currLang,
    },
    { title: this.translate.transform('Area'), field: 'area_ha' },
    {
      title: this.translate.transform('Territory'),
      field: 'territory_' + this.currLang,
    },
  ];

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

    const land_type = this.form.form.get('land_type');

    if (!land_type?.value) {
      land_type?.setValue(1);
      value.land_type = land_type?.value;
    }

    if (!value.land_type) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }

    if (this.mode.value === 'agromap_store_ai') value.ai = true;

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
      this.territory = res[0]?.territory_en;
    } catch (error: any) {
      this.messages.error(this.translate.transform(error.message));
    }
    this.loading = false;
  }

  async handleExportAsPdfClick(): Promise<void> {
    const doc = new jsPDF();
    if (this.table.table.nativeElement) {
      html2canvas(this.table.table.nativeElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 185; // A4 size
        const pageHeight = 297; // A4 size
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 13;

        const margin = 10;
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, margin, 210 - margin, margin); // top border
        doc.line(margin, 297 - margin, 210 - margin, 297 - margin); // bottom border
        doc.line(margin, margin, margin, 297 - margin); // left border
        doc.line(210 - margin, margin, 210 - margin, 297 - margin); // right border

        const centerX = 105 - imgWidth / 2;
        doc.addImage(imgData, 'PNG', centerX, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        const totalPages = Math.ceil(heightLeft / pageHeight);
        for (let i = 1; i <= totalPages; i++) {
          doc.text(`Page ${i} of ${totalPages}`, 10, 297 - 10);
          doc.addImage(
            imgData,
            'PNG',
            centerX,
            -pageHeight * i,
            imgWidth,
            imgHeight
          );
        }

        doc.save(`${this.territory}-cultures.pdf`);
      });
    }
  }

  ngAfterViewInit(): void {
    this.mode.setValue('agromap_store_ai');
    this.handleButtonClick();
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
