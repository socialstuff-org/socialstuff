import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import { defaultInviteCode } from '../../../../interfaces/InviteCode';
import {AdminSettings} from '../../../../../services/ap-settings.service';
import {ApiService} from '../../../../../services/api.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../../core/confirm-dialog/confirm-dialog.component';

/**
 * This Component represents a row inside the invite codes list from the InviteCodeList component. It has an InviteCode Object as input.
 * it shows all Information for the invite (code: string, expiration_date: string, max_usage_limitation: number, times_used: number)
 * and gives also the possibility to delete the invite code from the server. Before the function deleteInviteCode is called the user is shown
 * a warn dialog (another component) asking for confirmation, only when the user confirms, the code will be deleted.
 */

@Component({
  selector: 'app-invite-code-row',
  templateUrl: './invite-code-row.component.html',
  styleUrls: ['./invite-code-row.component.scss']
})
export class InviteCodeRowComponent implements OnInit {

  public loading = false;

  public hostname = '[::1]';
  public port = 3000;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
    private dialog: MatDialog
  ) {
  }


  ngOnInit(): void {
  }

  @Input() inviteCode = defaultInviteCode();
  @Input() reload: EventEmitter<any> = new EventEmitter<any>();

  public deleteInviteCode(): void {
    this.loading = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.deleteInviteCode(this.inviteCode.id).then(response => {
      this.loading = false;
      this.reload.emit(null);
    });
    console.log('Deleted ' + this.inviteCode.id.toString());
  }

  /**
   * This function will be called when pressing the delete button.
   */

  openDialog(): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      header: 'Deletion',
      message: 'You are about to delete the invite Code \'' + this.inviteCode.code + '\'. This deletion can\'t be reversed',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      warn: true
    };

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteInviteCode();
      }
    });
  }

}
