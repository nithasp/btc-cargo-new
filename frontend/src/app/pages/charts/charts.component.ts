import { Component, OnInit } from "@angular/core";
import Chart from "chart.js";
import {
  chartOptions,
  parseOptions,
  chartBarStackedData,
  chartDoughnutData,
  chartPieData,
  chartPointsData,
  chartSalesData,
  chartBarsData
} from "../../variables/charts";

@Component({
  selector: "app-charts",
  templateUrl: "charts.component.html"
})
export class ChartsComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    parseOptions(Chart, chartOptions());
    var chartBarStacked = document.getElementById("chart-bar-stacked");

    var barStackedChart = new Chart(chartBarStacked, {
      type: "bar",
      data: chartBarStackedData.data,
      options: chartBarStackedData.options
    });

    var chartDoughnut = document.getElementById("chart-doughnut");

    var doughnutChart = new Chart(chartDoughnut, {
      type: "doughnut",
      data: chartDoughnutData.data,
      options: chartDoughnutData.options
    });

    var chartPie = document.getElementById("chart-pie");

    var pieChart = new Chart(chartPie, {
      type: "pie",
      data: chartPieData.data,
      options: chartPieData.options
    });

    var chartPoints = document.getElementById("chart-points");

    var pointsChart = new Chart(chartPoints, {
      type: "line",
      data: chartPointsData.data,
      options: chartPointsData.options
    });

    var chartSales = document.getElementById("chart-sales2");

    var salesChart = new Chart(chartSales, {
      type: "line",
      data: chartSalesData.data,
      options: chartSalesData.options
    });

    var chartBars = document.getElementById("chart-bars2");

    var barsChart = new Chart(chartBars, {
      type: "bar",
      data: chartBarsData.data
    });
  }
}
