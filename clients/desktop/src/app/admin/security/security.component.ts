import { Component, OnInit } from '@angular/core';
import {AdminSettings} from '../../services/ap-settings.service';
import {ApiService}          from '../../services/api.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  public settings = {
    'two_factor_auth': {
      'on': false,
      'phone': false,
      'email': false
    },
    'confirmed_emails_only': false,
    'individual_pwd_req': {
      'on': false,
      'upper_case': false,
      'number': false,
      'special_char': false,
      'reg_ex': false,
      'reg_ex_string': '[]'
    },
    'inv_only': {
      'on': false,
      'inv_only_by_adm': false
    }
  };

  public hostname = '127.0.0.1';
  public port = 3002;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) { }

  ngOnInit(): void {
    // console.log(this.getCurrentSettings());
  }

  public getCurrentSettings(): any {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getSettings();
  }
}
