import {AppConfig}         from '../environments/environment';
import {Component, OnInit} from '@angular/core';
import {ElectronService}   from './core/services';
import {TranslateService}  from '@ngx-translate/core';
import {remote}            from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    // if (electronService.isElectron) {
    //   console.log(process.env);
    //   console.log('Run in electron');
    //   console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
    //   console.log('NodeJS childProcess', this.electronService.childProcess);
    // } else {
    //   console.log('Run in browser');
    // }

  }

  ngOnInit(): void {
  }

  public minimize(): void {
    remote.getCurrentWindow().minimize();
  }

  public maximize(): void {
    const window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  }

  public close(): void {
    remote.getCurrentWindow().close();
  }

}
