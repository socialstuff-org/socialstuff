import { Component, OnInit } from '@angular/core';
import { InviteCode, defaultInviteCode } from '../../../interfaces/InviteCode';
import utils from '../../../utils/utils';
import * as moment from 'moment';

@Component({
  selector: 'app-create-new-invite',
  templateUrl: './create-new-invite.component.html',
  styleUrls: ['./create-new-invite.component.scss']
})
export class CreateNewInviteComponent implements OnInit {

  constructor() { }
  public loading = false;
  public inviteCode = '';
  public expDate = '';
  public minDate = new Date();
  public useLimit = '';


  public genInvite(): void {
    this.inviteCode = utils.generateRandomCode(10);
  }

  ngOnInit(): void {
  }

}
