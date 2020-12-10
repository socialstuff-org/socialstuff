import {Component, OnInit}          from '@angular/core';
import {UtilService}                from '../services/util.service';
import {ContactService}             from '../services/contact.service';
import {acronymOfName, searchMatch} from '../../lib/helpers';
import {TitpServiceService}         from '../services/titp-service.service';
import { prefix }                   from '@trale/transport/log';
import {ContactWithLastMessage}     from '../models/Contact';

const log = prefix('clients/desktop/app/sidenav-component');

@Component({
  selector:    'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls:   ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  public chats: ContactWithLastMessage[];
  public loadingContacts = true;
  public searchTerm = '';

  constructor(
    private utils: UtilService,
    public contacts: ContactService,
    private titp: TitpServiceService
  ) {
  }

  ngOnInit() {
    this.chats = [];
    this.contacts.onContactListUpdated().subscribe(async () => {
      this.chats = await this.contacts.loadLastMessages(this.contacts.readContacts() as any);
      this.loadingContacts = false;
      log('got the following chats:', this.chats);
    });

    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (isConnected) {
        this.titp.client.incomingMessage().subscribe(message => {
          console.log('incoming message:', message);
        });
      }
    });
  }

  public acronym(name: string) {
    return acronymOfName(name);
  }

  searchContacts() {
    if (this.searchTerm === '') {
      return this.contacts.readContacts();
    }
    return this.contacts.readContacts()
      .filter(x => searchMatch(this.searchTerm, x.username)
                   || searchMatch(this.searchTerm, x.displayName || ''));
  }

}
