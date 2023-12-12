import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

  @Input() series!: Record<string, any>[];
  @Input() seriesFieldName: string = '';
  @Input() labels!: Record<string, any>[];
  @Input() labelsFieldName: string = '';
  @Input() dataLabelUnitOfMeasure: string = '';

  chartOptions: ChartOptions = {
    series: this.series?.map(
      (item) =>
        this.extractNumberFromString(item?.[this.seriesFieldName ?? '']) ?? 0
    ),
    chart: {
      height: 400,
      type: 'pie',
      toolbar: {
        show: true,
      },
    },
    labels: this.labels,
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
    colors: ['#1BA87D', '#B3EC84'],
  };

  constructor(private translate: TranslateService) {}

  private extractNumberFromString(char: string) {
    const string = char?.match(/\d+/);
    if (string == null) return null;
    const extractedNumber = parseFloat(string[0]);
    return extractedNumber;
  }

  ngOnChanges(changes: SimpleChanges) {
    const series = this.series?.map(
      (item) =>
        this.extractNumberFromString(item?.[this.seriesFieldName ?? '']) ?? 0
    );

    const labels = this.labels.map(
      (item) =>
        item?.[`${this.labelsFieldName ?? ''}_${this.translate.currentLang}`] ??
        ''
    );

    this.chartOptions.labels = labels;
    this.chartOptions.series = series;
  }
}