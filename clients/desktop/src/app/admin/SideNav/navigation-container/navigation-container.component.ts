import {Component, OnInit} from '@angular/core';
import {routesAdmin} from '../../../app-routing.module';
import {Route} from '@angular/router';

@Component({
  selector: 'app-navigation-container',
  templateUrl: './navigation-container.component.html',
  styleUrls: ['./navigation-container.component.scss']
})

export class NavigationContainerComponent implements OnInit {

  public navigationItems = [];



  private add(children: Array<Route>): Array<any> {
    return children.filter(route => !route.data.ignore).map(route => {
      const navigationItem = {
        path: route.data.parent ? `${route.data.parent}/${route.path}` : route.path,
        name: route.data.name,
        icon: route.data.icon,
        subRoutes: []
      };
      console.log('1: ', navigationItem);
      if (route.children) {
        navigationItem.subRoutes = this.add(route.children);
      }
      console.log('2: ', navigationItem);
      return navigationItem;
    });
  }

  constructor() { }

  ngOnInit(): void {
    console.log(routesAdmin[0]);
    this.navigationItems = this.add(routesAdmin[0].children);
    console.log('HHH', this.navigationItems)
  }

}
