import {Component, KeyValueDiffer, OnInit} from '@angular/core';
import {AdminSettings} from '../../services/ap-settings.service';
import {ApiService}          from '../../services/api.service';
import { SecuritySettings, defaultSettings } from '../interfaces/SecuritySettings';
import *as _ from 'lodash';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  public settingsBackup = defaultSettings();
  public settings = defaultSettings();
  public loading = false;
  public hostname = '[::1]';
  public port = 3002;

  constructor(
    private adminSettings: AdminSettings,
    private api: ApiService,
  ) {
  }

  get detectedChanges(): boolean {
    return !_.isEqual(this.settings, this.settingsBackup);
  }

  ngOnInit(): void {
    this.getSettings();
  }

  public getSettings(): any {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    return this.adminSettings.getSecuritySettings().then((setting: SecuritySettings) => {
      this.settings = _.cloneDeep(setting);
      this.settingsBackup  = _.cloneDeep(setting);
      console.log(this.settings);
    }).catch(error => {
      console.log(error);
    });
  }

  public saveSettings(): void {
    this.loading = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.setSecuritySettings(this.settings).then(response => {
      this.loading = false;
      console.log(response);
      this.settings = _.cloneDeep(response);
      this.settingsBackup = _.cloneDeep(response);
    });
  }

  public revertChanges(): void {
    console.log(this.settingsBackup);
    this.settings = _.cloneDeep(this.settingsBackup);
  }

  public printSettings(): void {
    console.log('set', this.settings);
    console.log('bu', this.settingsBackup);
  }
}
