import {Component, OnInit}    from '@angular/core';
import {Contact}              from '../models/Contact';
import {ActivatedRoute}       from '@angular/router';
import {ContactService}       from '../services/contact.service';
import {TitpServiceService}   from '../services/titp-service.service';
import {CryptoStorageService} from '../services/crypto-storage.service';
import {DebugService}         from '../services/debug.service';

@Component({
  selector:    'app-chat-app',
  templateUrl: './chat-app.component.html',
  styleUrls:   ['./chat-app.component.scss']
})
export class ChatAppComponent implements OnInit {

  public chatPartner: Contact;
  public username = '';

  constructor(
    private titp: TitpServiceService,
    private activatedRoute: ActivatedRoute,
    private contacts: ContactService,
    private storage: CryptoStorageService,
    private debug: DebugService,
  ) {
  }

  async ngOnInit() {
    this.debug.loadSession();
    await new Promise((res) => {
      let localStorageLoaded = false;
      let titpConnected = false;
      this.storage.isLoaded.subscribe(value => {
        localStorageLoaded = true;
        if (localStorageLoaded === titpConnected) {
          res();
        }
      });

      const _a = this.titp.onConnectionStateChanged.subscribe((isConnected) => {
        if (!isConnected) {
          return;
        }
        titpConnected = true;
        _a.unsubscribe();
        if (localStorageLoaded === titpConnected) {
          res();
        }
      });

    });

    this.username = this.titp.client.username();
    console.log('username', this.username);
    this.activatedRoute.params.subscribe(async params => {
      const username = params.username;
      console.log(username);
      if (!username) {
        return;
      }
      const loadedContact = await this.contacts.load(username);
      console.log(loadedContact);
      if (!loadedContact) {
        return;
      }
      this.chatPartner = loadedContact;
    });

  }

}
