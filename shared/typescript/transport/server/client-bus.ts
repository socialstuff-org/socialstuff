// This file is part of the TITP.
//
// TITP is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TITP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with TITP.  If not, see <https://www.gnu.org/licenses/>.

import {deserializeServerMessage, ServerMessageType} from '../message';
import {TitpClientConnection}                        from './client-connection';
import {Observable, Subject}                         from 'rxjs';
import {CommonTitpClient}                            from '../client/common';
import {prefix}                                      from '../log';

const log = prefix('@trale/transport/server/client-bus');

export class TitpClientBus {
  get onForwardToOfflineUsers(): Observable<{ message: Buffer; recipient: string }[]> {
    return this._onForwardToOfflineUsers;
  }
  private _clients: { [username: string]: TitpClientConnection } = {};
  private _onDisconnect = new Subject<CommonTitpClient>();
  private _onForwardToOfflineUsers = new Subject<{ message: Buffer; recipient: string }[]>();

  constructor(private _endpoint: string) {
  }

  public onDisconnect(): Observable<CommonTitpClient> {
    return this._onDisconnect;
  }

  /**
   *
   * @param client
   */
  public pushClient(client: TitpClientConnection) {
    this._registerNewClient(client);
  }

  /**
   *
   * @param client
   * @private
   */
  private _registerNewClient(client: TitpClientConnection) {
    log('new client:', client.username());
    this._clients[client.username()] = client;
    client.on('close').subscribe(() => {
      this._onDisconnect.next(client);
      delete this._clients[client.username()];
      log('client disconnected:', client.username());
    });
    client.data().subscribe(this._onClientData.bind(this, client));
  }

  private _onClientData(client: TitpClientConnection, data: Buffer) {
    log(`got data from client '${client.username()}'`);
    const message = deserializeServerMessage(data);
    switch (message.type) {
      case ServerMessageType.chatMessage:
      case ServerMessageType.initialHandshake:
        // TODO forward server message to other servers
        if (Object.keys(message.localRecipients).length === 0) {
          break;
        }
        const offlineRecipients = [];
        for (const recipient in message.localRecipients) {
          const t = Buffer.alloc(2, 0);
          t.writeInt16BE(message.type);
          const signatureLength = Buffer.alloc(2, 0);
          signatureLength.writeInt16BE(message.localRecipients[recipient].length);
          const msg = Buffer.concat([t, signatureLength, message.localRecipients[recipient], message.content]);
          const recipientUsername = recipient.split('@')[0];
          if (this._clients[recipientUsername]) {
            this._clients[recipientUsername].write(msg);
          } else {
            offlineRecipients.push({recipient: recipientUsername, message: msg});
          }
        }
        if (offlineRecipients.length) {
          log('some users were offline:', offlineRecipients);
          this._onForwardToOfflineUsers.next(offlineRecipients);
        }
        break;
    }
  }
}
