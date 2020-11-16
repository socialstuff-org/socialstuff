import {Injectable} from '@angular/core';
import {Message} from "../models/Message";
import {Contact} from "../models/Contact";

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(

  ) {
  }

  public readContacts(): Contact[] {

    return [];
  }

  public fetchMessagesFromContact(contactIdentifier: string, startIndex: number, endIndex: number): Message[] {

    // TODO cryptoStorage load contact/conversation.txt


    // parse messages from startIndex till endIndex from decrypted conversation.txt
    // return selected messages
    return [];
  }

}
