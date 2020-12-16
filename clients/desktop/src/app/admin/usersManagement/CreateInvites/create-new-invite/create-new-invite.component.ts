import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { InviteCode, defaultInviteCode } from '../../../interfaces/InviteCode';
import {AdminSettings} from '../../../../services/ap-settings.service';
import {ApiService} from '../../../../services/api.service';
import utils from '../../../utils/utils';
import * as _ from 'lodash';

/**
 * This Component holds the functionality to create a new InviteCode and save it on the server. It has three fields:
 *
 * 1) Expiration Date: This field uses the ngx-mat-datetime package which adds the functionality of not choosing just a date but also a time.
 * 2) Usage Limitation: A number indicating how often the invite code can be used. Optional, default is 0 and specify that the invite code has no usage limitation.
 * 3) Invite Code: A string which will be used to when register onto the platform. A 10-character-long string (numbers and uc letters) can be generated using the generate button.
 */


@Component({
  selector: 'app-create-new-invite',
  templateUrl: './create-new-invite.component.html',
  styleUrls: ['./create-new-invite.component.scss']
})
export class CreateNewInviteComponent implements OnInit {

  public hostname = '[::1]';
  public port = 3000;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }
  public inviteCode = defaultInviteCode()
  public loading = false;
  public minDate = new Date();


  public genInvite(): void {
    this.inviteCode.code = utils.generateRandomCode(10);
  }

  ngOnInit(): void {
  }

  @Input() reload: EventEmitter<any> = new EventEmitter<any>();

  public addInviteCode(): void {
    console.log(this.hostname);
    this.loading = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.addInviteCode(this.inviteCode).then(response => {
      this.loading = false;
      this.inviteCode = defaultInviteCode();
      this.reload.emit(null);
    });
  }

}
