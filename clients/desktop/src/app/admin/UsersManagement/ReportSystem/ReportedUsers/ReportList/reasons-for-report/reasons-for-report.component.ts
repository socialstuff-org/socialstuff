import {Component, Input, OnInit} from '@angular/core';
import {UserReport} from '../../../../../interfaces/UserReport';

@Component({
  selector: 'app-reasons-for-report',
  templateUrl: './reasons-for-report.component.html',
  styleUrls: ['./reasons-for-report.component.scss']
})
export class ReasonsForReportComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() userReport: UserReport;

  get maxTimesReported(): number {
    let maxValue = 0;
    for (const reportReason of this.userReport.report_reasons) {
      maxValue = reportReason.times_reported > maxValue ? reportReason.times_reported : maxValue;
    }
    return maxValue;
  }

  getClassificationColor(val: number): string {
    const percentageVal = val / this.maxTimesReported * 100;
    if (percentageVal <= 25) return 'ok';
    else if (percentageVal <= 50) return 'low';
    else if (percentageVal <= 75) return 'middle';
    else if (percentageVal <= 100) return 'high';
  }
}
