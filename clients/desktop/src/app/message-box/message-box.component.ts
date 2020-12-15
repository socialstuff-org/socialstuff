import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChatMessage, ChatMessageType} from "@trale/transport/message";

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {

  public message: string;

  @Output() messageSent: EventEmitter<ChatMessage> = new EventEmitter();

  constructor(
  ) {
    this.message = '';
  }

  ngOnInit(): void {
  }

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
}
