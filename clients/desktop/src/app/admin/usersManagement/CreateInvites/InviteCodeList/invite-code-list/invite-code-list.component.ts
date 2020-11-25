import { Component, OnInit } from '@angular/core';
import {InviteCode, defaultInviteCode} from '../../../../interfaces/InviteCode';
import utils from '../../../../utils/utils';

@Component({
  selector: 'app-invite-code-list',
  templateUrl: './invite-code-list.component.html',
  styleUrls: ['./invite-code-list.component.scss']
})
export class InviteCodeListComponent implements OnInit {

  public inviteCodes: Array<InviteCode> = []

  constructor() { }

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      const newInvite = defaultInviteCode();
      newInvite.code = utils.generateRandomCode(7);
      newInvite.id = utils.generateRandomCode(7);
      newInvite.expiration_date = new Date().toDateString();
      this.inviteCodes.push(newInvite);
    }
  }

}
