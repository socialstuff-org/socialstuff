import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import { ReportReason, defaultReportReason } from '../../../../../interfaces/ReportReason';
import *as _ from 'lodash';
import {AdminSettings} from "../../../../../../services/ap-settings.service";
import {ApiService} from "../../../../../../services/api.service";

@Component({
  selector: 'app-report-reason-entry',
  templateUrl: './report-reason-entry.component.html',
  styleUrls: ['./report-reason-entry.component.scss']
})
export class ReportReasonEntryComponent implements OnInit {

  public hostname = '[::1]';
  public port = 3003;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  private backUpReportReason: ReportReason;

  ngOnInit(): void {
  }

  @Input() reportReason = defaultReportReason();
  @Input() editable = false;
  @Input() newEntry = false;
  @Input() reload: EventEmitter<any> = new EventEmitter<any>();

  editReportReason () {
    this.backUpReportReason = _.cloneDeep(this.reportReason);
    this.editable = true;
  }

  saveReportReason () {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    if (this.newEntry) {
      this.adminSettings.createReportReason(this.reportReason).then(response => {
        this.editable = false;
        this.reload.emit(null);
      });
    } else {
      this.adminSettings.editReportReason(this.reportReason).then(response => {
        this.editable = false;
      });
    }
  }

  cancelEditing () {
    this.reportReason = _.cloneDeep(this.backUpReportReason);
    this.editable = false;
  }
}
