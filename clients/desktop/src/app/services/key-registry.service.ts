import * as fs                                        from 'fs';
import * as path                                      from 'path';
import {ApiService}                                   from './api.service';
import {DataResponse}                                 from '@socialstuff/utilities/responses';
import {ContactService}                               from './contact.service';
import {ConversationKeyRegistry}                      from '@trale/transport/conversation-key-registry';
import {createECDH, createPublicKey, ECDH, KeyObject} from 'crypto';
import {CryptoStorageService}                         from './crypto-storage.service';
import {CURVE}                                        from '@trale/transport/constants/crypto-algorithms';
import {hashUsername}                                 from '../../lib/helpers';
import {HttpClient}                                   from '@angular/common/http';
import {Injectable}                                   from '@angular/core';
import {UserKeyRegistry}                              from '@trale/transport/user-key-registry';

/**
 * Service responsible for managing encryption keys.
 */
@Injectable({
  providedIn: 'root',
})
export class KeyRegistryService implements ConversationKeyRegistry, UserKeyRegistry {
  private _rsaKeys: { [username: string]: KeyObject } = {};
  private _conversationKeys: { [username: string]: Buffer } = {};
  private _serverAddress: string = '';

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private contacts: ContactService,
    private storage: CryptoStorageService
  ) {
  }

  /**
   * Setter for server address.
   * @param address The server address to be set
   */
  set serverAddress(address: string) {
    this._serverAddress = address;
  }

  /**
   * Fetches conversation key for a specific user. If local array of conversation keys does not contain the requested
   * key, the key will be requested from contact service.
   * @param username The username from which the conversation key shall be loaded
   * @return Promise<Buffer> containing conversation key
   * @throws Throws error if conversation key could not be loaded.
   */
  async fetchConversationKey(username: string): Promise<Buffer> {
    if (!username.includes('@')) {
      username += '@' + this._serverAddress;
    }
    if (this._conversationKeys[username]) {
      return this._conversationKeys[username];
    }
    const contact = await this.contacts.load(username);
    if (contact !== false) {
      this._conversationKeys[username] = contact.conversationKey;
      return contact.conversationKey;
    } else {
      throw new Error(`Could not load conversation key for user '${username}'!`);
    }
  }

  /**
   * Fetches RSA public key of a specific user. If local array of RSA public keys does not contain the requested
   * key, the key will be requested from contact service. If the contact service cannot load the specified user the RSA
   * public key will be requested from the identity service located on the server.
   * @param username The username from which the rsa public key shall be loaded
   * @return Promise<KeyObject> containing RSA public key
   */
  async fetchRsa(username: string): Promise<KeyObject> {
    if (this._rsaKeys[username]) {
      return this._rsaKeys[username];
    }
    const contact = await this.contacts.load(username);
    if (contact !== false) {
      this._rsaKeys[username] = contact.rsaPublicKey;
      return contact.rsaPublicKey;
    }
    if (username.endsWith(this._serverAddress)) {
      username = username.split('@')[0];
      console.log('on same server');
    } else {
      console.log('different server');
    }
    const {data: {public_key}} = await this.http.get<DataResponse<{ public_key: string }>>(this.api.remoteEndpoint() + '/identity/public-key-of/' + username).toPromise();
    const rsa = createPublicKey(public_key);
    this._rsaKeys[username] = rsa;
    return rsa;
  }

  /**
   * TODO @joernneumeyer
   * @param username
   */
  async loadEcdhForHandshake(username: string): Promise<ECDH | false> {
    try {
      const ecdhPrivateKey = await this.storage.storage.loadFileContent(['handshakes', hashUsername(username)]);
      const ecdh = createECDH(CURVE);
      ecdh.setPrivateKey(ecdhPrivateKey);
      return ecdh;
    } catch {
      return false;
    }
  }

  /**
   * TODO @joernneumeyer
   * @param username
   */
  async removeEcdhForHandshake(username: string): Promise<void> {
    await fs.promises.unlink(path.join(this.storage.storage.storageDirectory, 'handshakes', hashUsername(username)));
  }

  /**
   * Saves a conversation key for a specific user/contact. The user will be fetched from the contact service by its
   * username. If the user/contact could not be loaded a new contact instance will be created and registered to the
   * contact service.
   * @param username The username to which the conversation key belongs to
   * @param key The conversation key object
   */
  async saveConversationKey(username: string, key: Buffer): Promise<void> {
    let contact = await this.contacts.load(username);
    if (contact) {
      contact.conversationKey = key;
      await this.contacts.update(contact);
    } else {
      contact = {
        username,
        usernameHash: hashUsername(username),
        conversationKey: key,
        rsaPublicKey: await this.fetchRsa(username),
      };
      await this.contacts.addContact(contact);
    }
  }

  /**
   * TODO @joernneumeyer
   * @param username
   * @param ecdh
   */
  async saveEcdhForHandshake(username: string, ecdh: ECDH): Promise<void> {
    const serialized = Buffer.from(ecdh.getPrivateKey());
    await this.storage.storage.persistFileContent(['handshakes', hashUsername(username)], serialized);
  }
}
