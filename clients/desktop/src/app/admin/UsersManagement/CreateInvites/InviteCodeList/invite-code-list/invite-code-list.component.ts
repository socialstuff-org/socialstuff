import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InviteCode, defaultInviteCode} from '../../../../interfaces/InviteCode';
import {AdminSettings} from '../../../../../services/ap-settings.service';
import {ApiService} from '../../../../../services/api.service';

/**
 * This Component holds the table with all existing invite codes. It is responsible for loading all entries from the back-end through the function
 * getInviteCodes from the Gateway and presenting them in a table. The component iterates through all entries and passing the data of each entry towards
 * another component presenting a row in the table. The Component has as input an EventEmitter to pass it towards the InviteCodeRow component, making it possible
 * to trigger the getInviteCodes function after deleting an InviteCode from the InviteCodeRow component and update the data.
 */

@Component({
  selector: 'app-invite-code-list',
  templateUrl: './invite-code-list.component.html',
  styleUrls: ['./invite-code-list.component.scss']
})
export class InviteCodeListComponent implements OnInit {

  public inviteCodes: Array<InviteCode> = [defaultInviteCode()]
  public hostname = '[::1]';
  public port = 3000;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  /**
   * ngOnInit is executed at the time in point this component is loaded into the DOM of the browser. It calls the function for retrieving all invite codes and
   * subscribe to the EventEmitter passed from the parent component. If the emit function on this EventEmitter is called inside any of the child components,
   * the invite codes will be reloaded.
   */

  ngOnInit(): void {
    this.getInviteCodes();
    this.reload.subscribe(() => {
      this.getInviteCodes();
    });
  }
  @Input() reload: EventEmitter<any> = new EventEmitter<any>()

  /**
   * Function to load all invite codes from the back-end. First the Endpoint for the next back-end call is set, secondly the getInviteCodes function from the
   * gateway is called and all the entries from the response are pushed into the inviteCodes Array.
   * Errors are caught and currently logged into the console. An Snackbar showing the error still needs to be implemented.
   */

  public getInviteCodes(): any {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getInviteCodes().then((inviteCodes) => {
      this.inviteCodes = inviteCodes.ret;
      console.log(inviteCodes.ret);
    }).catch(error => {
      console.log(error);
    });
  }

}
