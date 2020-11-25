import { Component, OnInit } from '@angular/core';
import { createUserReport } from '../../../../../interfaces/UserReport';
import utils from '../../../../../utils/utils';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {

  public userReports = [];

  constructor() { }

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      const username = utils.generateRandomCode(34);
      const reasons = [];
      for ( let k = 0; k < Math.round(Math.random() * 10); k++) {
        const reason = utils.generateRandomCode(7);
        const timesReported = Math.round(Math.random() * 10);
        reasons.push({
          reason: reason,
          times_reported: timesReported
        });
      }
      const newUserReport = createUserReport(username, reasons);
      this.userReports.push(newUserReport);
    }
    console.log(this.userReports);
  }

}
