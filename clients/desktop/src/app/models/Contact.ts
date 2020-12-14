import {KeyObject} from 'crypto';
import {Message}   from './Message';

/**
 * Contact interface. Used for standardized contact objects.
 */
export interface Contact {
  username: string;
  usernameHash: string;
  displayName?: string;
  rsaPublicKey: KeyObject;
  conversationKey: Buffer;
}

/**
 * Extended interface providing a contact with an optional latest message from the related contact.
 */
export interface ContactWithLastMessage extends Contact {
  lastMessage?: Message
}
