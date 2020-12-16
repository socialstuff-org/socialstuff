import {Component, Input, OnInit}   from '@angular/core';
import {ContactService}             from '../services/contact.service';
import {acronymOfName, searchMatch} from '../../lib/helpers';
import {TitpService}                from '../services/titp.service';
import {prefix}                     from '@trale/transport/log';
import {Contact, ContactWithLastMessage}     from '../models/Contact';
import {ChatMessage}                from '@trale/transport/message';
import {ApiService}                 from 'app/services/api.service';
import {ChatMessageType}            from '@trale/transport/message';
import { Observable } from 'rxjs';

/**
 * Logger for debugging.
 */
const log = prefix('clients/desktop/app/sidenav-component');

@Component({
  selector:    'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls:   ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {

  @Input() username: string;
  @Input() newMessageSent: Observable<{ recipient: Contact, message: ChatMessage }>;

  public ChatMessageType = ChatMessageType;
  public chats: ContactWithLastMessage[] = [];
  public loadingContacts = true;
  public searchTerm = '';

  constructor(
    public contacts: ContactService,
    private titp: TitpService,
    private api: ApiService,
  ) {
  }

  ngOnInit() {
    this.contacts.onContactListUpdated().subscribe(async () => {
      this.chats = await this.contacts.loadLastMessages(this.contacts.readContacts() as any);
      log('got the following chats with last messages:', this.chats);
    });

    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (isConnected && this.loadingContacts) {
        this.loadingContacts = false;
        this.contacts.load(this.titp.client.username() + '@' + this.api.hostname);
      }
    });

    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (!isConnected) {
        return;
      }
      this.titp.client.incomingMessage().subscribe(message => {
        const senderChat = this.chats.filter(x => x.username === message.senderName)[0];
        if (!senderChat) {
          console.warn('could not load chat for user', message.senderName);
          return;
        }
        senderChat.lastMessage = message;
      });
    });

    this.newMessageSent.subscribe(message => {
      const senderChat = this.chats.filter(x => x.username === message.recipient.username)[0];
        if (!senderChat) {
          return;
        }
        senderChat.lastMessage = message.message;
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

  /**
   * Filter the contacts based on a search term given in the {searchTerm} field.
   */
  searchContacts() {
    if (this.searchTerm === '') {
      return this.contacts.readContacts();
    }
    return this.contacts.readContacts()
      .filter(x => searchMatch(this.searchTerm, x.username)
                   || searchMatch(this.searchTerm, x.displayName || ''));
  }

}
