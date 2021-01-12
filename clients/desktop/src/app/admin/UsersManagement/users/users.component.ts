import { Component, OnInit } from '@angular/core';

/**
 * This Component just contains a router-outlet loading components based on the url path. This is necessary to have shared path of "/users/" which gives the navigation
 * sidebar the possibility to either hide or expand the users navigation items based on the current path.
 */

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
