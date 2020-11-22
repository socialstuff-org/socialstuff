import { Component, OnInit }                   from '@angular/core';
import {ChatMenuItem, createEmptyChatMenuItem} from "../models/ChatMenuItem";
import {UtilService}                           from "../services/util.service";
import {ContactService}                        from '../services/contact.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  public chats: ChatMenuItem[];
  public loadingContacts = true;

  constructor(
    private utils: UtilService,
    private contacts: ContactService,
  ) { }

  ngOnInit(): void {
    this.chats = [];

    this.contacts.isLoaded.subscribe(() => {
      this.chats = this.contacts.readContacts().map(x => ({ id: 0, username: x.username, realName: x.displayName, acronym: this.utils.generateAcronym(x.displayName || '') }));
      this.loadingContacts = false;
    });
  }

}
