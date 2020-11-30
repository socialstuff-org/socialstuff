import {Injectable}                              from '@angular/core';
import {Message}                                 from '../models/Message';
import {CryptoStorageService}                    from './crypto-storage.service';
import {Contact, ContactWithLastMessage}         from '../models/Contact';
import {TextRecordStorage}                       from '@trale/persistence/crypto-storage';
import {createHash, createHmac, createPublicKey} from 'crypto';
import {ChatProperties}                          from '../models/ChatProperties';
import * as fs                                   from 'fs';
import * as path                                 from 'path';
import {Subject}                                 from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  get isLoaded(): Subject<void> {
    return this._isLoaded;
  }

  private _contactStorage: TextRecordStorage;
  private _contacts: Contact[] = [];
  private _isLoaded = new Subject<void>();

  constructor(
    private storage: CryptoStorageService,
  ) {
    storage.isLoaded.subscribe(async () => {
      if (this._contactStorage) {
        await this._contactStorage.close();
      }
      const contactsPath = path.join(storage.path, 'contacts.txt');
      let contactsExist = true;
      try {
        const stat = await fs.promises.stat(contactsPath);
        if (stat.size < 2) {
          contactsExist = false;
        }
      } catch {
        await fs.promises.writeFile(contactsPath, '');
        contactsExist = false;
      }
      this._contactStorage = await this.storage.storage.openTextRecordStorage(['contacts.txt']);
      if (contactsExist) {
        await this._loadContacts();
      }
      this._isLoaded.next();
    });
  }

  /**
   * Unload/close the contact service session.
   * This method has to be called between session of the same user, in order to avoid dangling (open) file descriptors.
   */
  public async unLoad() {
    await this._contactStorage.close();
  }

  /**
   * Loads all contacts of the current user session into the service.
   * @private
   */
  private async _loadContacts() {
    const usernames = [];
    for await (const r of this._contactStorage.records()) {
      usernames.push(r.toString('utf-8'));
    }
    const contactPromises = usernames.map(async username => {
      const hash = createHmac('sha512', this.storage.masterKey);
      hash.update(username);
      const usernameHash = hash.digest('hex');
      const propertiesContent = await this.storage.storage.loadFileContent(['chats', usernameHash, 'chat.properties']);
      const properties = JSON.parse(propertiesContent.toString('utf-8')) as ChatProperties;
      const contact: Contact = {
        username,
        displayName:     properties.customDisplayName,
        conversationKey: Buffer.from(properties.conversationKey, 'base64'),
        rsaPublicKey:    createPublicKey(properties.rsaPublicKey),
        usernameHash,
      };
      return contact;
    });
    this._contacts = await Promise.all(contactPromises);
  }

  /**
   * Load all last (most recent) messages from the chat histories of the provided contacts.
   * This method may be used to create an overview of the last interactions with the provided contacts.
   * @param contacts
   */
  public async loadLastMessages(contacts: Contact[]): Promise<ContactWithLastMessage[]> {
    const foo = contacts.map(async contact => {
      const records = await this.storage.storage.openTextRecordStorage([contact.usernameHash, 'chat.log']);
      const lastMessageString = await records.records().next();
      await records.close();

      const lastMessage = lastMessageString.done
                          ? null
                          : JSON.parse((lastMessageString.value as Buffer).toString('utf-8')) as Message;
      return {
        ...contact,
        lastMessage,
      };
    });
    return Promise.all(foo);
  }

  /**
   * Check whether a contact with the given username exists.
   * If the contact exists, their SHA512 username hash will be returned.
   * If the contact does not exist, {false} will be returned.
   * @param username
   */
  public async exists(username: string): Promise<string | false> {
    const usernameHash = createHash('sha512')
      .update(username)
      .digest()
      .toString('hex');
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
      usernameHash,
      rsaPublicKey:    createPublicKey(properties.rsaPublicKey),
      conversationKey: Buffer.from(properties.conversationKey, 'base64'),
    };
  }

  /**
   * Opens a {TextRecordStorage}, via which chat messages can be loaded.
   * After opening the chat, it has to be closed by the component issuing access to the chat in the first place!
   * @param contact
   */
  public async openChat(contact: Contact) {
    return this.storage.storage.openTextRecordStorage(['chats', contact.usernameHash, 'chat.log']);
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
    const hmac = createHmac('sha512', this.storage.masterKey);
    hmac.update(contact.username);
    const usernameHash = hmac.digest().toString('hex');
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
    };
    const serializedProperties = Buffer.from(JSON.stringify(properties), 'utf8');
    await this.storage.storage.persistFileContent(['chats', usernameHash, 'chat.properties'], serializedProperties);
    await this._contactStorage.addRecord(Buffer.from(contact.username, 'utf-8'));
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
      rsaPublicKey: contact.rsaPublicKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      customDisplayName: contact.displayName,
      conversationKey: contact.conversationKey.toString('base64'),
    }
    const serializedProperties = Buffer.from(JSON.stringify(properties), 'utf8');
    await this.storage.storage.persistFileContent(['chats', contact.usernameHash, 'chat.properties'], serializedProperties);
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
