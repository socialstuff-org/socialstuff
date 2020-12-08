import {Component, OnInit} from '@angular/core';
import {Message}           from '../models/Message';
import {UtilService}       from '../services/util.service';
import {DebugService}      from '../services/debug.service';
import {ContactService}    from '../services/contact.service';
import {Contact}           from '../models/Contact';
import {RouteParameter}    from '../../annotations';
import {ActivatedRoute}    from '@angular/router';

@Component({
  selector:    'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls:   ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  public messages: Message[];
  public contact: Contact;

  @RouteParameter('id')
  public contactNameHash: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private utils: UtilService,
    private debug: DebugService,
    private contacts: ContactService,
  ) {
  }

  async ngOnInit() {
  }

}
