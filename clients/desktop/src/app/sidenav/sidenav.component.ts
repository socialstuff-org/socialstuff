import {Component, OnInit}          from '@angular/core';
import {ChatMenuItem, fromContact}  from '../models/ChatMenuItem';
import {UtilService}                from '../services/util.service';
import {ContactService}             from '../services/contact.service';
import {acronymOfName, searchMatch} from '../../lib/helpers';
import {ActivatedRoute}             from '@angular/router';

@Component({
  selector:    'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls:   ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  public chats: ChatMenuItem[];
  public loadingContacts = true;
  public contactName: string = '';

  constructor(
    private utils: UtilService,
    public contacts: ContactService,
  ) {
  }

  ngOnInit(): void {
    this.chats = [];

    this.contacts.onContactListUpdated().subscribe(() => {
      this.chats = this.contacts.readContacts().map(fromContact);
      this.loadingContacts = false;
    });
  }

  public acronym(name: string) {
    return acronymOfName(name);
  }

  searchContacts() {
    if (this.contactName === '') {
      return this.contacts.readContacts();
    }
    return this.contacts.readContacts()
      .filter(x => searchMatch(this.contactName, x.username)
                   || searchMatch(this.contactName, x.displayName || ''));
  }

}
