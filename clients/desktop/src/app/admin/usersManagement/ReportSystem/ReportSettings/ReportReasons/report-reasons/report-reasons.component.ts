import { Component, OnInit } from '@angular/core';
import utils from '../../../../../utils/utils';
import { ReportReason, createReportReason } from '../../../../../interfaces/ReportReason';

@Component({
  selector: 'app-report-reasons',
  templateUrl: './report-reasons.component.html',
  styleUrls: ['./report-reasons.component.scss']
})
export class ReportReasonsComponent implements OnInit {

  public reportReasons: Array<ReportReason> = [];

  constructor() { }

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      const reason = utils.generateRandomCode(7);
      const maxViolations = Math.round(Math.random() * 10);
      const newReason = createReportReason(reason, reason, maxViolations);
      this.reportReasons.push(newReason);
    }
    console.log(this.reportReasons);
  }

}
