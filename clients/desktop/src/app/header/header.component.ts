import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() chatPartner: string;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  public logout() {
    // TODO connect with auth service
    this.router.navigateByUrl('/login');
  }

}
