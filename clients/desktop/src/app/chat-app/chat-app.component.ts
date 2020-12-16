import {Component, OnDestroy, OnInit}    from '@angular/core';
import {Contact}              from '../models/Contact';
import {ActivatedRoute, Router}       from '@angular/router';
import {ContactService}       from '../services/contact.service';
import {TitpService}          from '../services/titp.service';
import {CryptoStorageService} from '../services/crypto-storage.service';
import {DebugService}         from '../services/debug.service';
import { prefix } from '@trale/transport/log';
import { ChatMessage, ChatMessageType } from '@trale/transport/message';
import { Observable, Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as moment from 'moment';
import { webmBlobDuration } from 'lib/helpers';

const log = prefix('clients/desktop/component/chat-app');

declare let particlesJS: any;

/**
 * Chat app component
 *
 * This is the main component of [Trale messenger]{@link https://trale.org}. It is responsible for handling the active chat view as well as current
 * header and sidenav data.
 */
@Component({
  selector:    'app-chat-app',
  templateUrl: './chat-app.component.html',
  styleUrls:   ['./chat-app.component.scss']
})
export class ChatAppComponent implements OnInit, OnDestroy {

  public chatPartner: Contact;
  public username = '';
  public currentChatNewMessageStream = new Subject<ChatMessage>();
  public newMessageSent = new Subject<{recipient: string, message: ChatMessage}>();

  constructor(
    private titp: TitpService,
    private activatedRoute: ActivatedRoute,
    private contacts: ContactService,
    private storage: CryptoStorageService,
    private debug: DebugService,
    private router: Router,
  ) {
  }
  ngOnDestroy(): void {
    this.titp.client.end();
  }

  /**
   * Initialization of chat application
   *
   * Loading debug session, loading [local storage]{@link CryptoStorageService} and awaiting connection to Trale server.
   * If storage loaded and connection established ... TODO @joernneumeyer
   *
   * @return {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    particlesJS.load('particles-js', '../assets/particles.json', function() {
      console.log('callback - particles.js config loaded');
    });

    const debugSession = await this.debug.loadSession();
    if (debugSession === false && this.titp.connected === false) {
      this.router.navigate(['/', 'login']);
      return;
    }
    log('required chat app resources are loaded!');
    

    this.username = this.titp.client.username();
    this.activatedRoute.params.subscribe(async params => {
      const username = params.username;
      if (!username) {
        return;
      }
      const loadedContact = await this.contacts.load(username);
      if (!loadedContact) {
        return;
      }
      this.chatPartner = loadedContact;
    });

    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      let _sub: any;
      let notifySub: any;
      if (isConnected) {
        _sub = this.titp.client.incomingMessage().subscribe(this.onIncomingMessage.bind(this));
        // @ts-ignore
        notifySub = this.titp.client.incomingMessage().pipe(throttleTime(5000)).subscribe(this.messagePushNotify.bind(this));
      } else {
        _sub?.unsubscribe();
        notifySub?.unsubscribe();
      }
    });

  }

  async onIncomingMessage(message: ChatMessage) {
    if (message.senderName === this.chatPartner.username) {
      this.currentChatNewMessageStream.next(message);
    }
  }

  async messagePushNotify(message: ChatMessage) {
    let body = message.senderName;
    switch (message.type) {
      case ChatMessageType.text:
        let textContent = message.content.toString('utf8');
        if (textContent.length < 30) {
          textContent = textContent.substr(0, 30) + '…';
        }
        body += ' wrote: ' + textContent;
        break;
      case ChatMessageType.voice:
        const voiceBlob = new Blob([message.content], { type: 'audio/webm;codecs=opus' });
        const voiceMessageDuration = await webmBlobDuration(voiceBlob);
        body += 'send a voice message (' + moment.duration(voiceMessageDuration) + ')';
        break;
    }
    new Notification('Trale', {
      body
    });
  }

  public onMessageSent(message: {recipient: string, message: ChatMessage}) {
    log('message has been propagated properly')
    this.newMessageSent.next(message);
  }

}
