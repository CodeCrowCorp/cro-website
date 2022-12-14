import { Component, OnInit, Input } from '@angular/core'
// import { ChartDataSets, ChartOptions } from 'chart.js'
import * as _ from 'lodash'
// import { Color, BaseChartDirective, Label } from 'ng2-charts'

@Component({
    selector: 'app-creator-videos-insights',
    templateUrl: './creator-videos-insights.component.html',
    styleUrls: ['./creator-videos-insights.component.scss']
})
export class CreatorVideosInsightsComponent implements OnInit {
    @Input() videos: any

    public totalViews: number = 0
    public totalWatchTime: number = 0
    public mostViewedVideo: any

    constructor() {}

    ngOnInit() {
        // TODO: Most viewed video
        // const mostViews = this.videos.map(video => ({ video: video.stream.title, views: video.views.map(view => view.viewCounter).reduce((a, b) => a + b) }))
        this.totalViews = _(this.videos)
            .map((video) => video.views)
            .flatten()
            .map((view: any) => view.viewCounter)
            .value()
            .reduce((a, b) => a + b, 0)
        this.totalWatchTime = _(this.videos)
            .map((video) => video.views)
            .flatten()
            .map((view: any) => view.viewsTimestamps)
            .flatten()
            .map(($timestamp: any) => $timestamp.duration)
            .value()
            .reduce((a, b) => a + b, 0)
    }

    public lineChartData: any = [
        {
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false
        }
    ]
    public lineChartLabels: any[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
    public lineChartOptions: any = {
        responsive: true,
        scales: {
            gridLines: {
                display: false
            },
            xAxes: [
                {
                    display: false
                }
            ],
            yAxes: [
                {
                    display: false
                }
            ]
        },
        maintainAspectRatio: false,
        legend: {
            display: false
        }
    }
    public lineChartColors: any = [
        {
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ]
    public lineChartLegend = true
    public lineChartType = 'line'
}
