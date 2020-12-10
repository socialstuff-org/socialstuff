import {Component, OnInit}                   from '@angular/core';
import {Message}                             from '../models/Message';
import {ChatPartner, createEmptyChatPartner} from '../models/ChatPartner';
import {UtilService}                         from '../services/util.service';
import {DebugService}                        from '../services/debug.service';
import {ContactService}                      from '../services/contact.service';
import {take}                                from '../../lib/functional';

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  public messages: Message[];
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
    const chat = await this.contacts.openChat(undefined);
    const messages = take(chat.records());
    const a = messages(3);
  }

}
