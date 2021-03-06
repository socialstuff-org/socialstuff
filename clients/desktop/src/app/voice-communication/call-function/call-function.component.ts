import { Component, OnInit } from '@angular/core';
import {createEmptyMessage, Message} from '../../models/Message';

@Component({
  selector: 'app-call-function',
  templateUrl: './call-function.component.html',
  styleUrls: ['./call-function.component.scss']
})
export class CallFunctionComponent implements OnInit {


  public messages: Message[];
  public chatPartner: string;

  constructor() {
    this.messages = [];
    this.chatPartner = 'Jörn Neumeyer';

    // sample data for UI testing
    const message = createEmptyMessage();
    message.message = 'lorem ipsum';
    message.time = '20:01';
    message.isSender = true;
    message.sent = true;
    this.messages.push(message);

    const secondMessage = createEmptyMessage();
    secondMessage.message = 'test text for some GUI testing';
    secondMessage.time = '20:04';
    secondMessage.isSender = true;
    secondMessage.delivered = true;
    this.messages.push(secondMessage);

    const thirdMessage = createEmptyMessage();
    thirdMessage.message = 'lorem asdkasdnmas das dnas f asdasda asdasdas as.';
    thirdMessage.time = '20:12';
    thirdMessage.isSender = false;
    thirdMessage.seen = true;
    this.messages.push(thirdMessage);

    const fourthMessage = createEmptyMessage();
    fourthMessage.message = 'pin k 1n2 31 lkf as asdsa.';
    fourthMessage.time = '20:30';
    fourthMessage.isSender = true;
    fourthMessage.seen = true;
    this.messages.push(fourthMessage);

    const fifthMessage = createEmptyMessage();
    fifthMessage.message = 'This is some longer chat message so we can test proper sizing on the chat bubbles.';
    fifthMessage.time = '20:41';
    fifthMessage.isSender = false;
    fifthMessage.delivered = true;
    this.messages.push(fifthMessage);

    // later on the messages will be retrieved by the server in the correct order
    this.messages = this.messages.slice().reverse();
  }

  ngOnInit(): void {
  }

}
