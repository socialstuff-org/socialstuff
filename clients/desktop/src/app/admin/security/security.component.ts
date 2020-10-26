import { Component, OnInit } from '@angular/core';
import {AdminSettings} from '../../services/ap-settings.service';
import {ApiService}          from '../../services/api.service';
import {AppConfigService}    from '../../services/app-config.service';
@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  twoFactAuth: boolean;
  twoFactAuthPhone: boolean;
  twoFactAuthMail: boolean;
  confirmedMailOnly: boolean;
  individualPassReq: boolean;
  reqUpperCase: boolean;
  reqNumber: boolean;
  reqCharacter: boolean;
  ownRegex: boolean;
  reqRegex: boolean;
  invitesOnly: boolean;
  invitesOnlyByAdmin: boolean;

  public hostname = '127.0.0.1';
  public port = 8080;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) { }

  ngOnInit(): void {
    console.log(this.getCurrentSettings());
  }

  public getCurrentSettings() {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getSettings();
  }
}
