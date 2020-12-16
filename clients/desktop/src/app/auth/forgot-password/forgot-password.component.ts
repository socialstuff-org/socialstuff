import { Component, OnInit } from '@angular/core';

/**
 * Forgot password component
 *
 * Responsible for requesting a new password if needed.
 */
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  username: '';
  email: '';

  constructor() { }

  /**
   * TODO
   */
  ngOnInit(): void {
  }

  /**
   * TODO
   */
  public resetPassword(){
    // TODO
  }
}
