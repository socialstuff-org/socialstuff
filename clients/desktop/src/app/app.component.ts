import {AppConfig} from '../environments/environment';
import {ChatMenuItem, createEmptyChatMenuItem} from './models/ChatMenuItem';
import {Component, OnInit} from '@angular/core';
import {ElectronService} from './core/services';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // sample data
  public chats: ChatMenuItem[];

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
    this.chats = [];
  }

  ngOnInit(): void {
    const contactNeumeyer = createEmptyChatMenuItem();
    contactNeumeyer.id = 1;
    contactNeumeyer.username = 'bitcrusher';
    contactNeumeyer.realName = 'Jörn Neumeyer';
    contactNeumeyer.acronym = AppComponent.generateAcronym(contactNeumeyer.realName);
    this.chats.push(contactNeumeyer);

    const contactVanderZee = createEmptyChatMenuItem();
    contactVanderZee.id = 1;
    contactVanderZee.username = 'codeLakeFounder';
    contactVanderZee.realName = 'Maurits van der Zee';
    contactVanderZee.acronym = AppComponent.generateAcronym(contactVanderZee.realName);
    this.chats.push(contactVanderZee);

    const ContactJansen = createEmptyChatMenuItem();
    ContactJansen.id = 1;
    ContactJansen.username = 'mx30';
    ContactJansen.acronym = AppComponent.generateAcronym(ContactJansen.realName);
    this.chats.push(ContactJansen);

  }

  /**
   * Convert a string to obtain first character of each word.
   * If more than two words are present only the first two characters are taken.
   * @param realName String to be transformed
   * @return acronym The acronym string
   */
  private static generateAcronym(realName: string): string {
    let acronym = realName.split(' ').map(x => x.charAt(0)).join('');
    return acronym.charAt(0) + acronym.charAt(acronym.length - 1);
  }
}
