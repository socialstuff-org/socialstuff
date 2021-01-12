import { Component, OnInit } from '@angular/core';

/**
 * This component is loaded over the router-outlet into the "SettingsView" Component. In the app-routing module it is decided, that this is the standard
 * component shown when logged in as an admin. Currently it shows dummy data, in the Future it will show general information about the Usage of the SocialStuff
 * Server like amount of members number of open invites and so on. It is important to consider that all the data which will be shown, will not violate privacy standards
 * of the users.
  */

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})

export class DashboardViewComponent implements OnInit {

  private tileInformations = [
    {
      name: 'Open Invites',
      id: 'openInvites',
      amount: 405
    },
    {
      name: 'Number of Users',
      id: 'nbUsers',
      amount: 3455
    },
    {
      name: 'Active Users',
      id: 'activeUsers',
      amount: 212
    },
    {
      name: 'Reported Users',
      id: 'reportedUsers',
      amount: 4
    }
  ];

  private activeTile = 'openInvites';

  constructor() { }

  ngOnInit(): void {
  }

  private changeTile(id): void {
    this.activeTile = id;
  }

}
