import { Component, OnInit } from '@angular/core';
import utils from '../../../../../utils/utils';
import { ReportReason, createReportReason } from '../../../../../interfaces/ReportReason';
import {AdminSettings} from '../../../../../../services/ap-settings.service';
import {ApiService} from '../../../../../../services/api.service';

@Component({
  selector: 'app-report-reasons',
  templateUrl: './report-reasons.component.html',
  styleUrls: ['./report-reasons.component.scss']
})
export class ReportReasonsComponent implements OnInit {

  public reportReasons: Array<ReportReason> = [];
  public hostname = '127.0.0.1';
  public port = 3000;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      const reason = utils.generateRandomCode(7);
      const maxViolations = Math.round(Math.random() * 10);
      const newReason = createReportReason(reason, reason, maxViolations);
      this.reportReasons.push(newReason);
    }
    console.log(this.reportReasons);
  }

  public getInviteCodes(): any {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getReportReasons().then((reportReasons) => {
      this.reportReasons = reportReasons;
      console.log(reportReasons);
    }).catch(error => {
      console.log(error);
    });
  }

}
