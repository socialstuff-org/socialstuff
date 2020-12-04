import { Component, OnInit } from '@angular/core';

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
