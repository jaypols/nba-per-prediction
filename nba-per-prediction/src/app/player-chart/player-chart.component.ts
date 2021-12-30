import { Component, OnInit, Input, AfterViewInit, NgZone } from '@angular/core';
import { PlayerStats } from '../player-details/player-details.component';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_kelly from '@amcharts/amcharts4/themes/kelly';
// import am4themes_material from '@amcharts/amcharts4/themes/spiritedaway';

am4core.useTheme(am4themes_kelly);
// am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-player-chart',
  templateUrl: './player-chart.component.html',
  styleUrls: ['./player-chart.component.css'],
})
export class PlayerChartComponent implements OnInit, AfterViewInit {
  @Input() playerStats: PlayerStats;
  @Input() currentPlayer: string;
  @Input() players: string[];
  private chart: am4charts.XYChart;
  data = [];
  // Create chart instance

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      // ... chart code goes here .../////////////////////////////
      let chart = am4core.create('chartdiv', am4charts.XYChart);
      chart.paddingRight = 20;

      let title = chart.titles.create();
      title.text = 'PER vs Age';
      title.fontSize = 25;
      title.marginBottom = 30;
      title.fill = am4core.color('#e3e3e3');

      let ageAxis = chart.xAxes.push(new am4charts.ValueAxis());
      ageAxis.renderer.grid.template.location = 0;
      ageAxis.title.text = 'Age';
      ageAxis.title.fontWeight = 'bold';
      ageAxis.title.fill = am4core.color('#e3e3e3');
      ageAxis.renderer.labels.template.fill = am4core.color('#e3e3e3');

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;
      valueAxis.title.text = 'PER';
      valueAxis.title.fontWeight = 'bold';
      valueAxis.title.fill = am4core.color('#e3e3e3');
      // createPredictedPER();
      valueAxis.renderer.labels.template.fill = am4core.color('#e3e3e3');

      let predictedSeries = chart.series.push(new am4charts.LineSeries());
      predictedSeries.dataFields.valueY = this.currentPlayer + 'predictedPER';
      predictedSeries.dataFields.valueX = 'Age';
      predictedSeries.name = this.currentPlayer + ' (Predicted)';
      var size = Object.keys(this.data[this.currentPlayer]).length;
      predictedSeries.data = createChartData(
        this.data,
        size,
        this.currentPlayer,
        'predictedPER'
      );

      predictedSeries.strokeWidth = 5;

      predictedSeries.bullets.push(new am4charts.CircleBullet());
      predictedSeries.tooltipText = '{valueX}: [bold]{valueY}[/]';

      // predictedSeries.tooltipText = "[bold]{date.formatDate()}:[/] {value1}\n[bold]{previousDate.formatDate()}:[/] {value2}";
      // predictedSeries.tooltip.pointerOrientation = "vertical";

      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      console.log(this.players);
      for (var player of this.players) {
        console.log('^^' + player);
        let perSeries = chart.series.push(new am4charts.LineSeries());
        perSeries.dataFields.valueY = player + 'PER';
        perSeries.dataFields.valueX = 'Age';
        perSeries.name = player;
        var size = Object.keys(this.data[player]).length;
        perSeries.strokeWidth = 2;
        if (player == this.currentPlayer) {
          perSeries.strokeWidth = 5;
          perSeries.name = player + ' (Current)';

          size = size - 3;
          console.log('SIZEJEJJEJEEKDFSKDK' + size);
        }
        perSeries.data = createChartData(this.data, size, player, 'PER');
      }

      // let chartData = [];
      // console.log(size);
      // console.log(player);
      // console.log(type);
      // for (var i = 1; i < size; i++) {
      //   console.log(i);
      //   var per = this.data[player]['Season' + i][type];
      //   console.log(per);
      //   let dataItem = {
      //     Age: new Date(this.data[player]['Season' + i].Age),
      //   };
      //   dataItem[player + type] = per;
      //   console.log(dataItem);
      //   chartData.push(dataItem);
      // }
      // console.log(chartData);

      // series.data = chartData;

      // let series = chart.series.push(new am4charts.LineSeries());
      // series.dataFields.dateX = 'Age';
      // series.dataFields.valueY = 'predictedPER';

      // series.tooltipText = '{valueY.predictedPER}';
      chart.cursor = new am4charts.XYCursor();
      chart.legend = new am4charts.Legend();
      chart.legend.position = 'right';
      chart.legend.scrollable = true;
      chart.legend.labels.template.fill = am4core.color('#e3e3e3');
      chart.legend.valueLabels.template.fill = am4core.color('#e3e3e3');
      ///////////////////////////////////////////////////////////////////////////

      this.chart = chart;
    });

    function createChartData(
      data: any,
      size: number,
      player: string,
      type: string
    ) {
      let chartData = [];
      console.log(data);
      console.log(size);
      console.log(player);
      console.log(type);
      for (var i = 1; i < size; i++) {
        console.log(i);
        console.log(data);
        var per = data[player]['Season' + i][type];
        console.log(per);
        let dataItem = {
          Age: data[player]['Season' + i].Age,
        };
        dataItem[player + type] = per;
        console.log(dataItem);
        chartData.push(dataItem);
      }
      console.log(chartData);
      return chartData;
    }

    function animateBullet(bullet) {
      let animation = bullet.animate(
        [
          { property: 'scale', from: 1, to: 5 },
          { property: 'opacity', from: 1, to: 0 },
        ],
        1000,
        am4core.ease.circleOut
      );
      animation.events.on('animationended', function (event) {
        animateBullet(event.target.object);
      });
    }
    function createPredictedPER() {
      // series.dataFields.valueY = this.currentPlayer + 'predictedPER';
      // series.dataFields.dateX = 'Age';
      // series.name = this.currentPlayer;
      // var size = Object.keys(this.data[this.currentPlayer]).length;
      // series.data = createChartData(size, this.currentPlayer, 'predictedPER');
      // return chart;
    }
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
  ngOnInit(): void {
    console.log('@@');
    console.log(this.playerStats);
    this.data = this.playerStats as any;
    console.log(this.data);
  }
}
