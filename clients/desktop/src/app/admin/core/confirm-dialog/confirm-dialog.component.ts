import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  // header: 'Deletion',
  // message: 'You are about to delete an invite Code, this deletion can\'t be reversed',
  // confirmationButton: 'Delete',
  // cancelButton: 'Cancel'

  private header: string;
  private message: string;
  private confirmButton: string;
  private cancelButton: string;
  private warn: boolean;

  private warnIcon = '../../../../assets/icons/warn_icon.svg'

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.header = data.header || 'Confirmation';
    this.message = data.message || 'Are you sure?';
    this.confirmButton = data.confirmButton || 'Yes';
    this.cancelButton = data.cancelButton || 'Cancel';
    this.warn = data.warn || false;
  }

  ngOnInit(): void {
  }

}
