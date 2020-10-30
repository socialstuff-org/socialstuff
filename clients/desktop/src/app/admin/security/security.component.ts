import {Component, KeyValueDiffer, OnInit} from '@angular/core';
import {AdminSettings} from '../../services/ap-settings.service';
import {ApiService}          from '../../services/api.service';
import { ServerSettings, defaultSettings } from '../interfaces/ServerSettings';
import *as _ from 'lodash';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  public settingsBackup = defaultSettings();
  public settings = defaultSettings();
  public hostname = '127.0.0.1';
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
    return this.adminSettings.getSettings().then((setting: ServerSettings) => {
      this.settings = _.cloneDeep(setting);
      this.settingsBackup  = _.cloneDeep(setting);
    });
  }

  public saveSettings(): void {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    this.adminSettings.setSettings(this.settings);
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
