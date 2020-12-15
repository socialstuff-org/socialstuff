import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ChatMessage, ChatMessageType} from '@trale/transport/message';
import {TitpService}                  from '../../services/titp.service';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss']
})
export class ChatBubbleComponent implements OnInit {

  ChatMessageType = ChatMessageType;

  @Input() message: ChatMessage;
  public isSender = false;

  @ViewChild('audioPlayer')
  private audioPlayer: ElementRef<HTMLAudioElement>;

  constructor(
    private titp: TitpService
  ) { }

  ngOnInit(): void {
    this.isSender = this.message.senderName === this.titp.client.userHandle;

    if (this.message.type === ChatMessageType.voice) {
      const blob = new Blob([this.message.content], {type: 'audio/webm'});
      const url = window.URL.createObjectURL(blob);
      this.audioPlayer.nativeElement.src = url;
    }

  }

}
