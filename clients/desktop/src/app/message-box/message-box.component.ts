import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChatMessage, ChatMessageType} from "@trale/transport/message";
import { webmBlobDuration } from 'lib/helpers';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {

  public message: string;

  @Output()
  /**
   * {@link EventEmitter} that emits as soon as a message from the message box component shall be sent.
   */
  messageSent: EventEmitter<ChatMessage> = new EventEmitter();

  constructor(
  ) {
    this.message = '';
  }

  ngOnInit(): void {
  }

  /**
   * Handler that emits a new event, containing the composed chat message.
   */
  public sendMessage() {
    this.message = this.message.trim();
    if (this.message.length === 0) {
      return;
    }
    console.log('Sending message: ' + this.message);
    const message: ChatMessage = {
      content: Buffer.from(this.message),
      attachments: [],
      senderName: '',
      sentAt: new Date(),
      type: ChatMessageType.text,
    };
    this.messageSent.emit(message);
    this.message = '';
    console.log('textarea cleared!');
  }

  /**
   * Handler that emits a new event, containing the voice message recorded in the {@link VoiceMessageComponent}.
   * @param voiceRecording The recorded voice message.
   */
  public async sendVoidMessage(voiceRecording: Blob) {
    console.log('got recording!', voiceRecording);
    const message: ChatMessage = {
      content: Buffer.from(await voiceRecording.arrayBuffer()),
      attachments: [],
      senderName: '',
      sentAt: new Date(),
      type: ChatMessageType.voice,
    };
    this.messageSent.emit(message);
  }
}
