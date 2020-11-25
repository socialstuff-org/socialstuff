import {Component, Input, OnInit} from '@angular/core';
import { ReportReason, defaultReportReason } from '../../../../../interfaces/ReportReason';
import *as _ from 'lodash';

@Component({
  selector: 'app-report-reason-entry',
  templateUrl: './report-reason-entry.component.html',
  styleUrls: ['./report-reason-entry.component.scss']
})
export class ReportReasonEntryComponent implements OnInit {

  constructor() { }

  private backUpReportReason: ReportReason;

  ngOnInit(): void {
  }

  @Input() reportReason = defaultReportReason();
  @Input() editable = false;
  @Input() newEntry = false;

  editReportReason () {
    this.backUpReportReason = _.cloneDeep(this.reportReason);
    this.editable = true;
  }

  cancelEditing () {
    this.reportReason = _.cloneDeep(this.backUpReportReason);
    this.editable = false;
  }
}
