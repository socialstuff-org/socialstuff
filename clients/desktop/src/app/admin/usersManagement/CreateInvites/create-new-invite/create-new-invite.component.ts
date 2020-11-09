import { Component, OnInit } from '@angular/core';
import { InviteCode, defaultInviteCode } from '../../../interfaces/InviteCode';

@Component({
  selector: 'app-create-new-invite',
  templateUrl: './create-new-invite.component.html',
  styleUrls: ['./create-new-invite.component.scss']
})
export class CreateNewInviteComponent implements OnInit {

  constructor() { }
  public loading = false;


  ngOnInit(): void {
  }

}
