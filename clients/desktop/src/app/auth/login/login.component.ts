import { Component, OnInit } from '@angular/core';
import {AuthService}         from '../../services/auth.service';
import {ApiService}          from '../../services/api.service';
import {AppConfigService}    from '../../services/app-config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public hostname = '127.0.0.1';
  public port = 8080;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private config: AppConfigService
  ) { }

  ngOnInit(): void {
  }

  public login() {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.auth.login(this.username, this.password);
  }

}
