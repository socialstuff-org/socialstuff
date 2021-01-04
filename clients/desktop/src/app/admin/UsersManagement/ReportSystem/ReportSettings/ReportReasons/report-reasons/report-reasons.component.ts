import {Component, EventEmitter, OnInit} from '@angular/core';
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
  public hostname = '[::1]';
  public port = 3002;

  public reload: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  ngOnInit(): void {
    this.getReportReasons();

    this.reload.subscribe(() => {
      this.getReportReasons();
    });
  }

  public getReportReasons(): any {
    console.log('reload');
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getReportReasons().then((reportReasons) => {
      this.reportReasons = reportReasons;
      console.log(reportReasons);
    }).catch(error => {
      console.log(error);
    });
  }

}
