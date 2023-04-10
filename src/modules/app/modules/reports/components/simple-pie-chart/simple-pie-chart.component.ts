import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
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
};

export interface IChartData {
  name: string;
  data: number[];
  dates: string[];
}

@Component({
  selector: 'app-simple-pie-chart',
  templateUrl: './simple-pie-chart.component.html',
  styleUrls: ['./simple-pie-chart.component.scss'],
})
export class SimplePieChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent | ElementRef;
  @Input() chartData!: IChartData[];

  chartOptions: ChartOptions = {
    series: [44, 55],
    chart: {
      height: 400,
      type: 'pie',
      toolbar: {
        show: true,
      },
    },
    labels: ['Продуктивный', 'Непродуктивный'],
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
      formatter: function (val: number): string {
        return val.toFixed(1) + 'га';
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value) {
          return value.toFixed(1) + '%';
        },
      },
    },
    legend: {
      position: 'bottom',
    },
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // this.chartOptions.series = this.chartData;
    // this.chartOptions.xaxis.categories = this.chartData[0].dates;
  }
}
