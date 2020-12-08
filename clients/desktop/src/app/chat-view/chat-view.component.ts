import {Component, OnInit, ViewChild} from '@angular/core';
import {ChatPartner, createEmptyChatPartner} from '../models/ChatPartner';
import {UtilService}                         from '../services/util.service';
import {DebugService}                        from '../services/debug.service';
import {ContactService}                      from '../services/contact.service';
import {take}                                from '../../lib/functional';
import {ChatMessage} from '@trale/transport/message';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  @ViewChild(CdkVirtualScrollViewport, { static: false }) virtualScrollViewport: CdkVirtualScrollViewport;

  public messages: ChatMessage[];
  public chatPartner: ChatPartner;

  constructor(
    private utils: UtilService,
    private debug: DebugService,
    private contacts: ContactService,
  ) {
    this.messages = [];
    this.chatPartner = createEmptyChatPartner();
    this.chatPartner.realName = 'Max Mustermann';
    this.chatPartner.username = 'maxmustermann99';
    this.chatPartner.imageUrl = 'https://cdn.code-lake.com/mergery/users/vanderzee.jpg';
    this.chatPartner.acronym = this.utils.generateAcronym(this.chatPartner.realName);
  }

  async ngOnInit() {
    // load messages from storage
/*    const chat = await this.contacts.openChat(undefined);
    const messages = take(chat.records());
    const a = messages(3);*/
  }

  messageSentHandler(message: ChatMessage): void {
    console.log('message', message);
    this.messages.push(message);
    this.messages = [...this.messages];
    // this.messages.unshift(message);
    console.log('array', this.messages);
    this.virtualScrollViewport.scrollToIndex(this.messages.length - 1);
    setTimeout(() => {
      const items = document.getElementsByClassName('list-item');
      items[items.length - 1].scrollIntoView();
    }, 10);
  }

}
