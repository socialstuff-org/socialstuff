import {Component, EventEmitter, OnInit} from '@angular/core';

@Component({
  selector: 'app-create-invite',
  templateUrl: './create-invite.component.html',
  styleUrls: ['./create-invite.component.scss']
})
export class CreateInviteComponent implements OnInit {

  constructor() { }

  public reload: EventEmitter<any> = new EventEmitter<any>()

  ngOnInit(): void {

  }

}
