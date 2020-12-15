import {Component, Input, OnInit}     from '@angular/core';
import { UtilService }                from '../services/util.service';
import { ContactService }             from '../services/contact.service';
import { acronymOfName, searchMatch } from '../../lib/helpers';
import { TitpServiceService }         from '../services/titp-service.service';
import { prefix }                     from '@trale/transport/log';
import { ContactWithLastMessage }     from '../models/Contact';
import { ChatMessage }                from '@trale/transport/message';
import { KeyRegistryService }         from 'app/services/key-registry.service';
import { ApiService }                 from 'app/services/api.service';
import {createEmptyMessage}           from "../models/Message";

const log = prefix('clients/desktop/app/sidenav-component');

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {

  @Input() username: string;

  public chats: ContactWithLastMessage[] = [];
  public loadingContacts = true;
  public searchTerm = '';

  constructor(
    public contacts: ContactService,
    private titp: TitpServiceService,
    private api: ApiService,
  ) {
  }

  ngOnInit() {
    this.contacts.onContactListUpdated().subscribe(async () => {
      this.chats = await this.contacts.loadLastMessages(this.contacts.readContacts() as any);
      log('got the following chats with last messages:', this.chats);
      this.chats[0].displayName = 'Jörn Neumeyer';
      this.chats[0].lastMessage = createEmptyMessage();
      this.chats[0].lastMessage.message = 'Trale ist so geil! Lorem pisum dolor sit amet foo';
    });

    let sub;

    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (isConnected) {
        sub = this.titp.client.incomingMessage().subscribe(this._handleIncomingMessage.bind(this));
      } else {
        sub.unsubscribe();
      }
      if (isConnected && this.loadingContacts) {
        this.loadingContacts = false;
        this.contacts.load(this.titp.client.username() + '@' + this.api.hostname);
      }
    });
  }

  private async _handleIncomingMessage(message: ChatMessage) {
    // if (message.type !== ChatMessageType.handshakeInitialization) {
    //   return;
    // }
    // const c: Contact = {
    //   username: message.senderName,
    //   displayName: '',
    //   rsaPublicKey: await this.keys.fetchRsa(message.senderName),
    //   conversationKey
    // };
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
