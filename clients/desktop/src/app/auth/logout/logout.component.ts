import {Component, OnInit} from '@angular/core';
import {DebugService}      from '../../services/debug.service';
import {delay}             from '@socialstuff/utilities/common';
import {Router}            from '@angular/router';

/**
 * Logout component
 *
 * Component responsible for handling logout operation
 */
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

  /**
   * Destroying session and redirecting to login page after two seconds.
   */
  ngOnInit(): void {
    this.debug.destroySession().then(r => r);
    delay(2000).then(() => {
      this.router.navigateByUrl('/login').then(r => r);
    });
  }

}
