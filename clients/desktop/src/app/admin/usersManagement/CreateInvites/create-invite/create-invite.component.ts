import {Component, EventEmitter, OnInit} from '@angular/core';

/**
 * This Component is a view component, it contains no functionality itself but it combines two other components: CreateNewInvite and InviteCodesList.
 */

@Component({
  selector: 'app-create-invite',
  templateUrl: './create-invite.component.html',
  styleUrls: ['./create-invite.component.scss']
})
export class CreateInviteComponent implements OnInit {

  constructor() { }

  /**
   * The reload attribute is important to make it possible triggering an event from a child component and passing it to the parent component.
   * The EventEmitter is stored in this component and passed to the Child Components. Because both child components holding now the same EventEmitter changes
   * from one component can be detected in the other component.
   */

  public reload: EventEmitter<any> = new EventEmitter<any>()

  ngOnInit(): void {

  }

}
