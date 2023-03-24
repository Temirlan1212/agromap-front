import { Component, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-spline-area-chart',
  templateUrl: './spline-area-chart.component.html',
  styleUrls: ['./spline-area-chart.component.scss'],
})
export class SplineAreaChartComponent {
  @ViewChild('chart') chart!: ChartComponent;

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
      colors: ['#39afd1','#ffbc00','#e3eaef','#CAC13B','#A580A1','#0B9B7A','#85046B','#807F82','#63FF0F','#FF800F'],
      curve: "smooth",
    },
    series: [
      {
        name: "NDVI",
        data: [0.4, 0.5, 0.1, 0.21, 0.2, 0.03, 0.21, -0.9],
      },
      {
        name: "NDMI",
        data: [0.11, 0.5, 0.31, 0.12, 0.322, -0.3, 0.1, -0.09],
      },
      {
        name: "NDWI",
        data: [0.4, 0.05, 0.1, 0.1, 0.21, -0.334, 0.11, 0.12],
      },
      {
        name: "MSAVI2",
        data: [0.04, -0.95, 0.9, 0.2, 0.02, 0.3, 0.91, 0.19],
      },
      {
        name: "NDRE",
        data: [0.412, -0.5, 0.21, -0.1, 0.122, 0.033, -0.21, 0.3],
      },
      {
        name: "EVI",
        data: [-0.12, 0.35, -0.41, 0.101, 0.122, 0.3, -0.21, 0.22],
      },
    ],
    legend: {
      offsetY: 5,
    },
    xaxis: {
      categories: [
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
      ],
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

  constructor() {}
}
