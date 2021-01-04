import {Component, Input, OnInit} from '@angular/core';
import { UserReport } from '../../../../../interfaces/UserReport';

@Component({
  selector: 'app-report-row',
  templateUrl: './report-row.component.html',
  styleUrls: ['./report-row.component.scss']
})
export class ReportRowComponent implements OnInit {

  public showMore = false;

  constructor() { }

  ngOnInit(): void {
  }

  @Input() userReport: UserReport;

  get totalTimesReported(): number {
    let timesReported = 0;
    for (const userReportReason of this.userReport.report_reasons) {
      timesReported += userReportReason.times_reported;
    }
    return timesReported;
  }

  setShowMore(): void {
    this.showMore = !this.showMore;
  }

}
