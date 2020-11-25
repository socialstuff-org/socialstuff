import {Injectable} from '@angular/core';

import {ConversationKeyRegistry}                      from '@trale/transport/conversation-key-registry';
import {UserKeyRegistry}                              from '@trale/transport/user-key-registry';
import {HttpClient}                                   from '@angular/common/http';
import {ApiService}                                   from './api.service';
import {createECDH, createPublicKey, ECDH, KeyObject} from 'crypto';
import {CryptoStorageService}                         from './crypto-storage.service';
import {DataResponse}                                 from '@socialstuff/utilities/responses';
import {ContactService}                               from './contact.service';
import {hashUsername}                                 from '../../lib/helpers';
import {CURVE}                                        from '@trale/transport/constants/crypto-algorithms';
import * as fs                                        from 'fs';
import * as path                                      from 'path';

@Injectable({
  providedIn: 'root',
})
export class KeyRegistryService implements ConversationKeyRegistry, UserKeyRegistry {
  private _rsaKeys: { [username: string]: KeyObject } = {};
  private _conversationKeys: { [username: string]: Buffer } = {};

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private contacts: ContactService,
    private storage: CryptoStorageService,
  ) {
  }

  async fetchConversationKey(username: string) {
    if (this._conversationKeys[username]) {
      return this._conversationKeys[username];
    }
    const contact = await this.contacts.load(username);
    if (contact !== false) {
      this._conversationKeys[username] = contact.conversationKey;
      return contact.conversationKey;
    } else {
      throw new Error('Could not load conversation key!');
    }
  }

  async fetchRsa(username: string) {
    if (this._rsaKeys[username]) {
      return this._rsaKeys[username];
    }
    const contact = await this.contacts.load(username);
    if (contact !== false) {
      this._rsaKeys[username] = contact.rsaPublicKey;
      return contact.rsaPublicKey;
    }
    const {data: {public_key}} = await this.http.get<DataResponse<{ public_key: string }>>(this.api.remoteEndpoint() + '/identity/public-key-of/' + username).toPromise();
    const rsa = createPublicKey(public_key);
    this._rsaKeys[username] = rsa;
    return rsa;
  }

  async loadEcdhForHandshake(username: string): Promise<ECDH | false> {
    const ecdhPrivateKey = await this.storage.storage.loadFileContent(['handshakes', hashUsername(username)]);
    const ecdh = createECDH(CURVE);
    ecdh.setPrivateKey(ecdhPrivateKey);
    return ecdh;
  }

  async removeEcdhForHandshake(username: string): Promise<void> {
    await fs.promises.unlink(path.join(this.storage.storage.storageDirectory, 'handshakes', hashUsername(username)));
  }

  async saveConversationKey(username: string, key: Buffer): Promise<void> {
    let contact = await this.contacts.load(username);
    if (contact === false) {
      contact = {
        username,
        usernameHash: hashUsername(username),
        conversationKey: undefined,
        rsaPublicKey: await this.fetchRsa(username),
      };
    }
    contact.conversationKey = key;
    await this.contacts.update(contact);
  }

  async saveEcdhForHandshake(username: string, ecdh: ECDH): Promise<void> {
    const serialized = Buffer.from(ecdh.getPrivateKey());
    await this.storage.storage.persistFileContent(['handshakes', hashUsername(username)], serialized);
  }
}
