import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ChartComponent,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexDataLabels,
  ApexTooltip,
  ApexTitleSubtitle,
  ApexLegend,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  title?: ApexTitleSubtitle;
  legend: ApexLegend;
  colors: any;
};

@Component({
  selector: 'app-simple-pie-chart',
  templateUrl: './simple-pie-chart.component.html',
  styleUrls: ['./simple-pie-chart.component.scss'],
})
export class SimplePieChartComponent implements OnChanges {
  @ViewChild('pie') chart!: ChartComponent | ElementRef;

  @Input() items!: Record<string, any>[];
  @Input() seriesFieldName: string = '';
  @Input() labelsFieldName: string = '';
  @Input() dataLabelUnitOfMeasure: string = '';
  @Input() colorsFieldName: string = '';
  colors: string[] = [
    '#39afd1',
    '#ffbc00',
    '#e3eaef',
    '#CAC13B',
    '#A580A1',
    '#0B9B7A',
    '#85046B',
    '#807F82',
    '#63FF0F',
    '#FF800F',
  ];

  chartOptions: ChartOptions = {
    series: this.items?.map((item) => item?.[this.seriesFieldName ?? ''] ?? 0),
    chart: {
      height: 400,
      type: 'pie',
      toolbar: {
        show: true,
      },
    },
    labels: this.items,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: (percent: number, opts): string => {
        const seriesIndex = opts.seriesIndex;

        return `${opts.w.config.series[seriesIndex].toFixed(1)} ${
          this.dataLabelUnitOfMeasure
        }`;
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value: number, opts) {
          const total = opts.config.series.reduce(
            (curr: any, prev: any) => curr + prev,
            0
          );
          return `${((value / total) * 100).toFixed(2)} %`;
        },
      },
    },
    legend: {
      position: 'bottom',
    },
    colors: '',
  };

  constructor(
    private translateSvc: TranslateService,
    private translate: TranslatePipe
  ) {}

  updateColors() {
    this.colors = [...(this.items ?? [])]?.map((item, index) => {
      return (
        item?.[this.colorsFieldName ?? ''] ?? this.colors?.[index] ?? '#fff'
      );
    });
  }

  updateLabels() {
    this.chartOptions.labels = this.items.map(
      (item) =>
        item?.[
          `${this.labelsFieldName ?? ''}_${this.translateSvc.currentLang}`
        ] ?? ''
    );
  }

  updateSeries() {
    this.chartOptions.series = this.items?.map(
      (item) => item?.[this.seriesFieldName ?? ''] ?? 0
    );
  }

  updateLocale() {
    this.chartOptions.chart.locales = [
      {
        name: this.translateSvc.currentLang,
        options: { toolbar: this.translate.transform('apex-chart-toolbar') },
      },
    ];
    this.chartOptions.chart.defaultLocale = this.translateSvc.currentLang;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateColors();
    this.updateLabels();
    this.updateSeries();
    this.updateLocale();
  }
}
