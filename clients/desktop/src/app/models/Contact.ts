import {KeyObject}   from 'crypto';
import {ChatMessage} from '@trale/transport/message';

/**
 * Contact interface. Used for standardized contact objects.
 */
export interface Contact {
  /**
   * The full user handle (e.g. username@server.com).
   */
  username: string;
  /**
   * The SHA512 hex representation of the username property.
   */
  usernameHash: string;
  /**
   * A custom defined name, which should be displayed instead of the username.
   */
  displayName?: string;
  /**
   * The asynchronous RSA public key of the contact.
   */
  rsaPublicKey: KeyObject;
  /**
   * The synchronous key used for communication encryption/decryption.
   */
  conversationKey: Buffer;
}

/**
 * Extended interface providing a contact with an optional latest message from the related contact.
 */
export interface ContactWithLastMessage extends Contact {
  /**
   * The last message in the chat between the logged-in user and a contact.
   */
  lastMessage?: ChatMessage
}
