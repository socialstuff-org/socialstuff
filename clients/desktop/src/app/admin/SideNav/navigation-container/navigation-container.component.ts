import {Component, OnInit} from '@angular/core';
import {routesSettings} from '../../../app-routing.module';
import {Route} from '@angular/router';

@Component({
  selector: 'app-navigation-container',
  templateUrl: './navigation-container.component.html',
  styleUrls: ['./navigation-container.component.scss']
})

export class NavigationContainerComponent implements OnInit {

  navigationItems = [];



  private add(children: Array<Route>): Array<any> {
    const items = [];
    children.forEach(route => {
      if (!route.data.ignore) {
        const navigationItem = {
          path: route.data.parent ? `${route.data.parent}/${route.path}` : route.path,
          name: route.data.name,
          icon: route.data.icon,
          subRoutes: []
        };
        if (route.children) {
          navigationItem.subRoutes = this.add(route.children);
        }
        items.push(navigationItem);
      }
    });
    return items;
  }

  constructor() { }

  ngOnInit(): void {
    this.navigationItems = this.add(routesSettings[0].children);
  }

}
