import {Component, Input, OnDestroy, OnInit, ViewChild}            from '@angular/core';
import {UtilService}                                               from '../services/util.service';
import {DebugService}                                              from '../services/debug.service';
import {ContactService}                                            from '../services/contact.service';
import {ActivatedRoute}                                            from '@angular/router';
import {TextRecordStorage}                                         from '@trale/persistence/crypto-storage';
import {CryptoStorageService}                                      from 'app/services/crypto-storage.service';
import {ChatMessage, deserializeChatMessage, serializeChatMessage} from '@trale/transport/message';
import {TitpService}                                               from 'app/services/titp.service';
import {Contact}                                                   from 'app/models/Contact';
import {prefix}                                                    from '@trale/transport/log';
import {filter}                                                    from 'rxjs/operators';
import {take}                                                      from '../../lib/functional';
import {CdkVirtualScrollViewport}                                  from '@angular/cdk/scrolling';
import {delay}                                                     from "@socialstuff/utilities/common";
import { ElementRef } from '@angular/core';

const log = prefix('clients/desktop/component/chat-view');

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit, OnDestroy {

  @Input('contact') contact: Contact;

  @ViewChild(CdkVirtualScrollViewport)
  public virtualScroll?: CdkVirtualScrollViewport;

  private recordingBuffer: any[] = [];
  //Playback Variables
  private recordingFinishedEvent : BlobEvent;
  @ViewChild('audioPlayer')
  private audioPlayer: ElementRef<HTMLAudioElement>;

  public messages: ChatMessage[] = [];
  public chat: TextRecordStorage;
  private chatConsumer: (n: number) => Promise<Buffer[]>

  constructor(
    private utils: UtilService,
    private debug: DebugService,
    private contacts: ContactService,
    private route: ActivatedRoute,
    private storage: CryptoStorageService,
    private titp: TitpService
  ) {
    debug.loadSession();
  }
  //Set MediaRecorder for Microphone
  public recordOption: 'Start' | 'Stop' = 'Start';
  private recorder: MediaRecorder;

  ngOnDestroy(): void {
    this.chat?.close();
  }

  async ngOnInit() {
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
      this.messages = (await this.chatConsumer(50)).reverse().map(deserializeChatMessage);
      await delay(20);
      this.virtualScroll.scrollTo({bottom: 0});
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

    const microphone = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(microphone);
    this.recorder.addEventListener('dataavailable', data => {
      // this.recordingBuffer.push(data);
      this.recordingFinishedEvent = data;
    });
  }

  async handleIncomingMessage(message: ChatMessage): Promise<void> {
    this.messages = [...this.messages, message];
    await this.chat.addRecord(serializeChatMessage(message));
    this.virtualScroll.scrollTo({bottom: 0});
  }

  public async messageSentHandler(message: ChatMessage): Promise<void> {
    message.senderName = this.titp.client.userHandle;
    log('message', message);
    await this.titp.client.sendChatMessageTo(message, [this.contact.username]);
    await this.handleIncomingMessage(message);
  }

  async toggleRecording() {
    if (this.recordOption === 'Start') {
      this.recorder.start();
      this.recordOption = 'Stop';
    } else {
      this.recorder.stop();
      this.recordOption = 'Start';
      await delay(0);
      this.audioPlayer.nativeElement.src = URL.createObjectURL(this.recordingFinishedEvent.data);
      this.recordingFinishedEvent = undefined;
    }
  }
}
