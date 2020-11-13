import { Component, OnInit } from '@angular/core';
import {AuthService}         from '../../services/auth.service';
import {ApiService}          from '../../services/api.service';
import {AppConfigService}    from '../../services/app-config.service';
import {Router} from "@angular/router";
import sweetalert from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public hostname = '127.0.0.1';
  public port = 8086;


  constructor(
    private auth: AuthService,
    private api: ApiService,
    private config: AppConfigService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  public async login() {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    try {
      const token = await this.auth.login(this.username, this.password);
      // TODO load local encryption keys
      console.log('token', token);
      await this.router.navigateByUrl('/landing');
    } catch (e) {
      if (typeof e === 'string') {
        await sweetalert.fire({
          text: e,
          title: 'Something\'s wrong, I can feel it!',
          showCloseButton: true,
        });
      } else {
        // TODO print custom error messages
      }
    }
  }

  public forgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

}
