import {Injectable}                      from '@angular/core';
import {Message}                         from '../models/Message';
import {CryptoStorageService}            from './crypto-storage.service';
import {Contact, ContactWithLastMessage} from '../models/Contact';
import {createPublicKey}     from 'crypto';
import {ChatProperties}                  from '../models/ChatProperties';
import * as fs                           from 'fs';
import * as path                         from 'path';
import {Observable, Subject}             from 'rxjs';
import {hashUsernameHmac}                from '../../lib/helpers';
import { prefix }                        from '@trale/transport/log';
import {deserializeChatMessage}          from '@trale/transport/message';

const log = prefix('clients/desktop/app/contact-service');

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private _contacts: Contact[] = [];
  private _onContactListUpdated = new Subject<Contact[]>();

  constructor(
    private storage: CryptoStorageService,
  ) {
    storage.isLoaded.subscribe(async () => {
      log('starting to load contacts');
      await this._loadContacts();
      log('loaded contacts');
    });
  }

  /**
   * An {@link Observable} which emits each time to local contact list is uodated/changed.
   */
  public onContactListUpdated(): Observable<Contact[]> {
    return this._onContactListUpdated;
  }

  /**
   * Unload/close the contact service session.
   * This method has to be called between session of the same user, in order to avoid dangling (open) file descriptors.
   */
  public async unLoad() {
    this._contacts = [];
  }

  /**
   * Loads all contacts of the current user session into the service.
   * @private
   */
  private async _loadContacts() {
    const contactBaseDirectory = path.join(this.storage.storage.storageDirectory, 'chats');
    const contactHashes = await fs.promises.readdir(contactBaseDirectory);
    if (contactHashes.length === 0) {
      return;
    }
    const contactPropertiesBuffers = await Promise.all<Buffer>(contactHashes.map(name => this.storage.storage.loadFileContent(['chats', name, 'chat.properties'])));
    const contactProperties = contactPropertiesBuffers.map<ChatProperties>(props => JSON.parse(props.toString('utf8')));
    const contacts = contactProperties.map<Contact>((props, i) => ({
      username:        props.username,
      displayName:     props.customDisplayName,
      conversationKey: Buffer.from(props.conversationKey, 'base64'),
      usernameHash:    contactHashes[i],
      rsaPublicKey:    createPublicKey(props.rsaPublicKey),
    }));
    this._contacts = contacts;
    this._onContactListUpdated.next([...contacts]);
    log('contacts:', contacts);
  }

  /**
   * Load all last (most recent) messages from the chat histories of the provided contacts.
   * This method may be used to create an overview of the last interactions with the provided contacts.
   * @param contacts
   */
  public async loadLastMessages(contacts: Contact[]): Promise<ContactWithLastMessage[]> {
    const foo = contacts.map(async contact => {
      const records = await this.storage.storage.openTextRecordStorage(['chats', contact.usernameHash, 'chat.log']);
      const lastMessageString = await records.records().next();
      await records.close();

      const lastMessage =
              lastMessageString.done
              ? null
              : deserializeChatMessage(lastMessageString.value as Buffer);
      return {
        ...contact,
        lastMessage,
      };
    });
    log('nr of last messages loading:', foo.length);
    return Promise.all(foo);
  }

  /**
   * Check whether a contact with the given username exists.
   * If the contact exists, their SHA512 username hash will be returned.
   * If the contact does not exist, {false} will be returned.
   * @param username
   */
  public async exists(username: string): Promise<string | false> {
    const usernameHash = hashUsernameHmac(username, this.storage.masterKey);
    try {
      await fs.promises.stat(path.join(this.storage.storage.storageDirectory, 'chats', usernameHash));
      return usernameHash;
    } catch {
      return false;
    }
  }

  /**
   * Loads a contact from the local storage.
   * If the contact cannot be found, {false} will be returned.
   * @param username
   */
  public async load(username: string): Promise<Contact | false> {
    const usernameHash = await this.exists(username);
    if (usernameHash === false) {
      return false;
    }
    const propertiesStr = await this.storage.storage.loadFileContent(['chats', usernameHash, 'chat.properties']);
    const properties: ChatProperties = JSON.parse(propertiesStr.toString('utf-8'));
    return {
      username,
      displayName: properties.customDisplayName,
      usernameHash,
      rsaPublicKey:    createPublicKey(properties.rsaPublicKey),
      conversationKey: Buffer.from(properties.conversationKey, 'base64'),
    };
  }

  /**
   * Opens a {@link TextRecordStorage}, via which chat messages can be loaded.
   * After opening the chat, it has to be closed by the component issuing access to the chat in the first place!
   * @param contact
   */
  public async openChat(contact: Contact) {
    return this.storage.storage.openTextRecordStorage(['chats', contact.usernameHash, 'chat.log'], 1024);
  }

  /**
   * Add a new contact for the current user session.
   * The contact will not be saved, if it already has been added.
   * @param contact
   */
  public async addContact(contact: Contact) {
    console.log('adding contact:', contact);
    console.log('existing contact names: ', this._contacts.map(x => x.username));
    if (this._contacts.some(x => x.username === contact.username)) {
      return;
    }
    const usernameHash = hashUsernameHmac(contact.username, this.storage.masterKey);
    const contactDirectory = path.join(this.storage.path, 'chats', usernameHash);
    {
      try {
        await fs.promises.stat(contactDirectory);
      } catch {
        await fs.promises.mkdir(contactDirectory);
      }
    }
    await fs.promises.writeFile(path.join(contactDirectory, 'chat.log'), '');
    const properties: ChatProperties = {
      rsaPublicKey:      contact.rsaPublicKey.export({format: 'pem', type: 'pkcs1'}).toString('utf8'),
      conversationKey:   contact.conversationKey.toString('base64'),
      customDisplayName: contact.displayName,
      username:          contact.username,
    };
    const serializedProperties = Buffer.from(JSON.stringify(properties), 'utf8');
    await this.storage.storage.persistFileContent(['chats', usernameHash, 'chat.properties'], serializedProperties);
    this._onContactListUpdated.next([...this._contacts]);
  }

  /**
   * Update an existing contact of the current user.
   * @param contact
   */
  public async update(contact: Contact) {
    const exists = await this.exists(contact.username);
    if (exists === false) {
      return;
    }
    const properties: ChatProperties = {
      rsaPublicKey:      contact.rsaPublicKey.export({type: 'pkcs1', format: 'pem'}).toString(),
      customDisplayName: contact.displayName,
      conversationKey:   contact.conversationKey.toString('base64'),
      username:          contact.username,
    };
    const serializedProperties = Buffer.from(JSON.stringify(properties), 'utf8');
    await this.storage.storage.persistFileContent(['chats', contact.usernameHash, 'chat.properties'], serializedProperties);
    const userIndex = this._contacts.map(x => x.username).indexOf(contact.username);
    this._contacts[userIndex] = contact;
    this._onContactListUpdated.next([...this._contacts]);
  }

  /**
   * Returns an array of all contacts.
   * This method shall only be called, after the crypto storage has been initialized!
   */
  public readContacts(): readonly Contact[] {
    return this._contacts;
  }

  public fetchMessagesFromContact(contactIdentifier: string, startIndex: number, endIndex: number): Message[] {

    // TODO cryptoStorage load contact/conversation.txt


    // parse messages from startIndex till endIndex from decrypted conversation.txt
    // return selected messages
    return [];
  }

}
