import {Component, OnInit}          from '@angular/core';
import {ChatMenuItem, fromContact}  from '../models/ChatMenuItem';
import {UtilService}                from '../services/util.service';
import {ContactService}             from '../services/contact.service';
import {acronymOfName, searchMatch} from '../../lib/helpers';
import {TitpServiceService}         from '../services/titp-service.service';

@Component({
  selector:    'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls:   ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  public chats: ChatMenuItem[];
  public loadingContacts = true;
  public contactName: string = '';

  constructor(
    private utils: UtilService,
    public contacts: ContactService,
    private titp: TitpServiceService
  ) {
  }

  async ngOnInit() {
    this.chats = [];

    this.contacts.onContactListUpdated().subscribe(() => {
      this.chats = this.contacts.readContacts().map(fromContact);
      this.loadingContacts = false;
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
    if (this.contactName === '') {
      return this.contacts.readContacts();
    }
    return this.contacts.readContacts()
      .filter(x => searchMatch(this.contactName, x.username)
                   || searchMatch(this.contactName, x.displayName || ''));
  }

}
