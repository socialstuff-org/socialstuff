import { Component, OnInit } from '@angular/core';
import {ChatMenuItem, createEmptyChatMenuItem} from "../models/ChatMenuItem";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  // sample data
  public chats: ChatMenuItem[];

  constructor() { }

  ngOnInit(): void {
    this.chats = [];

    const contactNeumeyer = createEmptyChatMenuItem();
    contactNeumeyer.id = 1;
    contactNeumeyer.username = 'bitcrusher';
    contactNeumeyer.realName = 'Jörn Neumeyer';
    contactNeumeyer.acronym = SidenavComponent.generateAcronym(contactNeumeyer.realName);
    this.chats.push(contactNeumeyer);

    const contactVanderZee = createEmptyChatMenuItem();
    contactVanderZee.id = 1;
    contactVanderZee.username = 'codeLakeFounder';
    contactVanderZee.realName = 'Maurits van der Zee';
    contactVanderZee.acronym = SidenavComponent.generateAcronym(contactVanderZee.realName);
    this.chats.push(contactVanderZee);

    const ContactJansen = createEmptyChatMenuItem();
    ContactJansen.id = 1;
    ContactJansen.username = 'mx30';
    ContactJansen.acronym = SidenavComponent.generateAcronym(ContactJansen.realName);
    this.chats.push(ContactJansen);
  }

  /**
   * Convert a string to obtain first character of each word.
   * If more than two words are present only the first two characters are taken.
   * @param realName String to be transformed
   * @return acronym The acronym string
   */
  private static generateAcronym(realName: string): string {
    let acronym = realName.split(' ').map(x => x.charAt(0)).join('');
    return acronym.charAt(0) + acronym.charAt(acronym.length - 1);
  }

}
