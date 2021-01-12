import {Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter}            from '@angular/core';
import {ContactService}                                            from '../services/contact.service';
import {ActivatedRoute, Params}                                            from '@angular/router';
import {TextRecordStorage}                                         from '@trale/persistence/crypto-storage';
import {CryptoStorageService}                                      from 'app/services/crypto-storage.service';
import {ChatMessage, deserializeChatMessage, serializeChatMessage} from '@trale/transport/message';
import {TitpService}                                               from 'app/services/titp.service';
import {Contact}                                                   from 'app/models/Contact';
import {prefix}                                                    from '@trale/transport/log';
import {filter}                                                    from 'rxjs/operators';
import {take}                                                      from '../../lib/functional';
import {CdkVirtualScrollViewport}                                  from '@angular/cdk/scrolling';
import {delay}                                                     from '@socialstuff/utilities/common';
import { DebugService } from 'app/services/debug.service';

/**
 * Logger for debugging.
 */
const log = prefix('clients/desktop/component/chat-view');

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit, OnDestroy {

  contact: Contact;
  @Output('messageSent') messageSent = new EventEmitter<{ recipient: Contact, message: ChatMessage }>();

  @ViewChild(CdkVirtualScrollViewport)
  public virtualScroll?: CdkVirtualScrollViewport;

  public messages: ChatMessage[] = [];
  public chat: TextRecordStorage;
  private chatConsumer: (n: number) => Promise<Buffer[]>

  constructor(
    private debug: DebugService,
    private contacts: ContactService,
    private route: ActivatedRoute,
    private storage: CryptoStorageService,
    private titp: TitpService
  ) {
    debug.loadSession();
  }

  ngOnDestroy(): void {
    this.deInit();
  }

  private async initForContact(contact: Contact) {
    this.contact = contact;
    this.chat = await this.contacts.openChat(contact);
    this.chatConsumer = take(this.chat.records());
    log('loaded some stuff');
    this.messages = (await this.chatConsumer(50)).reverse().map(deserializeChatMessage);
    log('done loading chat messages', this.messages);
    await delay(20);
    this.virtualScroll.scrollTo({bottom: 0});
    console.log('contact', contact);
  }

  private async deInit() {
    await this.chat?.close();
    this.chat = undefined;
  }

  /**
   * Initialized the model.
   */
  async ngOnInit() {
    log('initialized');
    const onChatPartnerChange = async (params: Params) => {
      await this.deInit();
      if (this.storage.storage) {
        const contact = await this.contacts.load(params.username);
          if (contact === false) {
            console.error('contact could not be loaded!');
            return;
          }
          this.initForContact(contact);
      } else {
        const _a = this.storage.isLoaded.subscribe(async () => {
          _a.unsubscribe();
          onChatPartnerChange(params);
        });
      }
    };
    this.route.params.subscribe(onChatPartnerChange);

    const sub = this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (isConnected) {
        sub.unsubscribe();
        this.titp.client
          .incomingMessage()
          .subscribe(this.handleIncomingMessage.bind(this));
      }
    })
  }

  /**
   * Handler for incoming messages, that is responsible for loading these messages into the list of chat messages.
   * @param message 
   */
  async handleIncomingMessage(message: ChatMessage): Promise<void> {
    log('got message:', message);
    if (message.senderName !== this.contact.username) {
      return;
    }
    this.messages = [...this.messages, message];
    this.virtualScroll.scrollTo({bottom: 0});
  }

  /**
   * Handler that is invoked when the logged-in user sends a message in the opened chat.
   * @param message 
   */
  public async messageSentHandler(message: ChatMessage): Promise<void> {
    message.senderName = this.titp.client.userHandle;
    log('message', message);
    await this.titp.client.sendChatMessageTo(message, [this.contact.username]);
    await this.handleIncomingMessage(message);
    await this.chat.addRecord(serializeChatMessage(message));
    this.messageSent.emit({ message, recipient: this.contact });
  }
}
