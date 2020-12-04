import { Component, OnInit, Input } from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss']
})
export class NavigationItemComponent implements OnInit {

  currentRoute: string

  constructor(location: Location, router: Router) {
    router.events.subscribe(val => {
      if (location.path() !== '') {
        this.currentRoute = location.path().split('/')[1];
      } else {
        this.currentRoute = 'Home';
      }
    });
  }

  ngOnInit(): void {
  }

  @Input() navigationItems = [{path: '', name: '', icon: '', subRoutes: []}]

}
