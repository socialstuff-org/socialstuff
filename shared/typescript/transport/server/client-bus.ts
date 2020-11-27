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
    this._clients[client.username()] = client;
    client.on('close').subscribe(() => {
      this._onDisconnect.next(client);
      delete this._clients[client.username()];
    });
    client.data().subscribe(this._onClientData.bind(this, client));
  }

  private _onClientData(client: TitpClientConnection, data: Buffer) {
    const message = deserializeServerMessage(data);
    switch (message.type) {
      case ServerMessageType.chatMessage:
        // TODO forward server message to other servers
        if (Object.keys(message.localRecipients).length === 0) {
          break;
        }
        const offlineRecipients = [];
        for (const recipient in message.localRecipients) {
          const t = Buffer.alloc(2, 0);
          t.writeInt16BE(ServerMessageType.chatMessage);
          const signatureLength = Buffer.alloc(2, 0);
          signatureLength.writeInt16BE(message.localRecipients[recipient].length);
          const msg = Buffer.concat([t, signatureLength, message.localRecipients[recipient], message.content]);

          if (this._clients[recipient]) {
            this._clients[recipient].write(msg);
          } else {
            offlineRecipients.push({recipient, message: msg});
          }
        }
        if (offlineRecipients.length) {
          this._onForwardToOfflineUsers.next(offlineRecipients);
        }
        break;
    }
  }
}
