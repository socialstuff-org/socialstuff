import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import { ReportReason, defaultReportReason } from '../../../../../interfaces/ReportReason';
import *as _ from 'lodash';
import {AdminSettings} from '../../../../../../services/ap-settings.service';
import {ApiService} from '../../../../../../services/api.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../../../core/confirm-dialog/confirm-dialog.component';

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
    private dialog: MatDialog
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

  deleteReportReason() {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.deleteReportReason(this.reportReason).then(response => {
      this.reload.emit(null);
    });
    console.log('DELETED');
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      header: 'Deletion',
      message: 'You are about to delete the Reason: \'' + this.reportReason.reason + '\'. This deletion can\'t be reversed',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      warn: true
    };

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteReportReason();
      }
    });
  }
}
