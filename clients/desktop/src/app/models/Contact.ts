import {KeyObject} from 'crypto';
import {Message}   from './Message';


export interface Contact {
  username: string;
  usernameHash: string;
  displayName?: string;
  rsaPublicKey: KeyObject;
  conversationKey: Buffer;
}

export interface ContactWithLastMessage extends Contact {
  lastMessage: Message
}
