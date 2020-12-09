import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InviteCode, defaultInviteCode} from '../../../../interfaces/InviteCode';
import {AdminSettings} from '../../../../../services/ap-settings.service';
import {ApiService} from '../../../../../services/api.service';

@Component({
  selector: 'app-invite-code-list',
  templateUrl: './invite-code-list.component.html',
  styleUrls: ['./invite-code-list.component.scss']
})
export class InviteCodeListComponent implements OnInit {

  public inviteCodes: Array<InviteCode> = []
  public hostname = '[::1]';
  public port = 3000;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  ngOnInit(): void {
    // for (let i = 0; i < 10; i++) {
    //   const newInvite = defaultInviteCode();
    //   newInvite.code = utils.generateRandomCode(7);
    //   newInvite.id = utils.generateRandomCode(7);
    //   newInvite.expiration_date = new Date().toDateString();
    //   this.inviteCodes.push(newInvite);
    // }

    this.getInviteCodes();
    this.reload.subscribe(() => {
      this.getInviteCodes();
    });
  }
  @Input() reload: EventEmitter<any> = new EventEmitter<any>()

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
