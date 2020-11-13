import { Injectable } from '@angular/core';

import { ConversationKeyRegistry } from '@trale/transport/conversation-key-registry';
import { UserKeyRegistry }         from '@trale/transport/user-key-registry';
import {HttpClient}                from '@angular/common/http';
import {ApiService}                from './api.service';

@Injectable({
  providedIn: 'root'
})
export class KeyRegistryService implements ConversationKeyRegistry, UserKeyRegistry {

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) { }

  async fetchConversationKey(username: string) {
    return Buffer.alloc(48, 0);
  }

  async fetchRsa(username: string) {
    const rsa = await this.http.get<any>(this.api.remoteEndpoint() + '/identity/public-key-of/' + username).toPromise();
    return rsa.data.public_key;
  }
}
