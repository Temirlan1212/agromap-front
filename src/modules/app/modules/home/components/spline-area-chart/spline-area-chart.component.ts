import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexGrid,
  ApexLegend,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  legend: ApexLegend;
};

export interface IChartData {
  name: string;
  data: number[];
  dates: string[];
}

@Component({
  selector: 'app-spline-area-chart',
  templateUrl: './spline-area-chart.component.html',
  styleUrls: ['./spline-area-chart.component.scss'],
})
export class SplineAreaChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() chartData!: IChartData[];

  chartOptions: ChartOptions = {
    chart: {
      height: 380,
      type: "area",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      colors: ['#39afd1', '#ffbc00', '#e3eaef', '#CAC13B', '#A580A1', '#0B9B7A', '#85046B', '#807F82', '#63FF0F', '#FF800F'],
      curve: "smooth",
    },
    series: [],
    legend: {
      offsetY: 5,
    },
    xaxis: {
      categories: [],
    },
    tooltip: {
      fixed: {
        enabled: false,
        position: "topRight",
      },
    },
    grid: {
      borderColor: "#f1f3fa",
    },
  };

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.chartOptions.series = this.chartData;
    this.chartOptions.xaxis.categories = this.chartData[0].dates;
  }
}
