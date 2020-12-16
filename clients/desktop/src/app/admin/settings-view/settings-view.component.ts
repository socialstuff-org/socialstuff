import {Component, NgModule, OnInit} from '@angular/core';

/**
 * This component is the first component which will be loaded when login as an admin. It contains the Header the Navigation sidebar and a router-outlet.
 * It does not contain any content by itself but instead the router-outlet will load components based on the url-path.
 */

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.scss']
})
export class SettingsViewComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

}
