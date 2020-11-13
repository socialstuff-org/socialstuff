import { Component, OnInit } from '@angular/core';
import {ChatMenuItem, createEmptyChatMenuItem} from "../models/ChatMenuItem";
import {UtilService} from "../services/util.service";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  // sample data
  public chats: ChatMenuItem[];

  constructor(
    private utils: UtilService,
  ) { }

  ngOnInit(): void {
    this.chats = [];

    const contactNeumeyer = createEmptyChatMenuItem();
    contactNeumeyer.id = 1;
    contactNeumeyer.username = 'bitcrusher';
    contactNeumeyer.realName = 'Jörn Neumeyer';
    contactNeumeyer.acronym = this.utils.generateAcronym(contactNeumeyer.realName);
    this.chats.push(contactNeumeyer);

    const contactVanderZee = createEmptyChatMenuItem();
    contactVanderZee.id = 1;
    contactVanderZee.username = 'codeLakeFounder';
    contactVanderZee.realName = 'Maurits van der Zee';
    contactVanderZee.acronym = this.utils.generateAcronym(contactVanderZee.realName);
    this.chats.push(contactVanderZee);

    const ContactJansen = createEmptyChatMenuItem();
    ContactJansen.id = 1;
    ContactJansen.username = 'mx30';
    ContactJansen.acronym = this.utils.generateAcronym(ContactJansen.realName);
    this.chats.push(ContactJansen);
  }

}
