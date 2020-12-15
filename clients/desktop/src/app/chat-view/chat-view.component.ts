import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UtilService}                         from '../services/util.service';
import {DebugService}                        from '../services/debug.service';
import {ContactService}                      from '../services/contact.service';
import { ActivatedRoute } from '@angular/router';
import { TextRecordStorage } from '@trale/persistence/crypto-storage';
import { CryptoStorageService } from 'app/services/crypto-storage.service';
import { ChatMessage, ChatMessageType, deserializeChatMessage, serializeChatMessage } from '@trale/transport/message';
import { TitpServiceService } from 'app/services/titp-service.service';
import { Contact } from 'app/models/Contact';
import { prefix } from '@trale/transport/log';
import { filter } from 'rxjs/operators';
import { take } from '../../lib/functional';

const log = prefix('clients/desktop/component/chat-view');

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit, OnDestroy {

  @Input('contact') contact: Contact;

  public messages: ChatMessage[] = [];
  public chat: TextRecordStorage;
  private chatConsumer: (n: number) => Promise<Buffer[]>
  // public contact: Contact;

  constructor(
    private utils: UtilService,
    private debug: DebugService,
    private contacts: ContactService,
    private route: ActivatedRoute,
    private storage: CryptoStorageService,
    private titp: TitpServiceService
  ) {
    debug.loadSession();
  }
  ngOnDestroy(): void {
    this.chat?.close();
  }

  ngOnInit() {
    const _a = this.storage.isLoaded.subscribe(async () => {
      _a.unsubscribe();
      const contact = await this.contacts.load(this.route.snapshot.params.username);
      if (contact === false) {
        console.error('contact could not be loaded!');
        return;
      }
      this.contact = contact;
      this.chat = await this.contacts.openChat(contact);
      this.chatConsumer = take(this.chat.records());
      this.messages = (await this.chatConsumer(10)).reverse().map(deserializeChatMessage);
      console.log('contact', contact);
    });
    
    this.titp.onConnectionStateChanged.subscribe(_ => {
      this.titp.client.incomingMessage()
        .pipe(
          // @ts-ignore
          filter<ChatMessage>(x => x.senderName === this.contact.username)
        )
        .subscribe(this.handleIncomingMessage.bind(this));
    });
  }

  async handleIncomingMessage(message: ChatMessage) {
    this.messages = [...this.messages, message];
    await this.chat.addRecord(serializeChatMessage(message));
  }

  public async messageSentHandler(message: ChatMessage) {
    message.senderName = this.titp.client.userHandle;
    log('message', message);
    await this.titp.client.sendChatMessageTo(message, [this.contact.username]);
    this.handleIncomingMessage(message);
  }
}
