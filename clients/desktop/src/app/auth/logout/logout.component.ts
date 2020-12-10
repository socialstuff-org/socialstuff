import {Component, OnInit} from '@angular/core';
import {Router}            from '@angular/router';
import {delay}             from '@socialstuff/utilities/common';
import {DebugService}      from '../../services/debug.service';

@Component({
  selector:    'app-logout',
  templateUrl: './logout.component.html',
  styleUrls:   ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router,
    private debug: DebugService,
  ) {
  }

  ngOnInit(): void {
    this.debug.destroySession();
    delay(2000).then(() => {
      this.router.navigateByUrl('/login');
    });
  }

}
