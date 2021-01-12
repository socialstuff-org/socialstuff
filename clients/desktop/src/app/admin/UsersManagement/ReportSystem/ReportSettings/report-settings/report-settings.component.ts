import { Component, OnInit } from '@angular/core';
import { ReportSettings, defaultSettings} from '../../../../interfaces/ReportSettings';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss']
})
export class ReportSettingsComponent implements OnInit {

  public settings = defaultSettings()

  constructor() { }

  ngOnInit(): void {
  }

}
