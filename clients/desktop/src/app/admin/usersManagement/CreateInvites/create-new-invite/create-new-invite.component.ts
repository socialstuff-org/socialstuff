import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { InviteCode, defaultInviteCode } from '../../../interfaces/InviteCode';
import {AdminSettings} from '../../../../services/ap-settings.service';
import {ApiService} from '../../../../services/api.service';
import utils from '../../../utils/utils';
import * as _ from 'lodash';


@Component({
  selector: 'app-create-new-invite',
  templateUrl: './create-new-invite.component.html',
  styleUrls: ['./create-new-invite.component.scss']
})
export class CreateNewInviteComponent implements OnInit {

  public hostname = '127.0.0.1';
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
    this.loading = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.addInviteCode(this.inviteCode).then(response => {
      this.loading = false;
      this.inviteCode = defaultInviteCode();
      this.reload.emit(null);
    });
  }

}
