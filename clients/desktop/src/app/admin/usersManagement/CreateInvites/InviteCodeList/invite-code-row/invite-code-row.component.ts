import {Component, Input, OnInit} from '@angular/core';
import { defaultInviteCode } from '../../../../interfaces/InviteCode';

@Component({
  selector: 'app-invite-code-row',
  templateUrl: './invite-code-row.component.html',
  styleUrls: ['./invite-code-row.component.scss']
})
export class InviteCodeRowComponent implements OnInit {

  public loading = false;

  constructor() { }


  ngOnInit(): void {
  }

  @Input() inviteCode = defaultInviteCode()

}
