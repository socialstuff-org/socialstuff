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

import {BinaryLike, sign}                            from 'crypto';
import {deserializeServerMessage, ServerMessageType} from '../message';
import {TitpClientConnection}                        from './client-connection';

export class TitpClientBus {
  private _clients: { [username: string]: TitpClientConnection } = {};

  constructor(private _endpoint: string) {
  }

  /**
   *
   * @param client
   */
  public pushClient(client: TitpClientConnection) {
    this._registerNewClient(client);
    // TODO send pending messages to client
  }

  /**
   *
   * @param client
   * @private
   */
  private _registerNewClient(client: TitpClientConnection) {
    console.log('Client bus> new client ' + client.username());
    this._clients[client.username()] = client;
    client.on('close').subscribe(() => {
      delete this._clients[client.username()];
    });
    client.data().subscribe(x => {
      const message = deserializeServerMessage(x);
      switch (message.type) {
        case ServerMessageType.chatMessage:
          // TODO forward server message to other servers
          if (Object.keys(message.localRecipients).length === 0) {
            break;
          }
          for (const recipient in message.localRecipients) {
            if (!this._clients[recipient]) {
              console.log('skipping offline recipient:', recipient);
            }
            const t = Buffer.alloc(2, 0);
            t.writeInt16BE(ServerMessageType.chatMessage);
            const signatureLength = Buffer.alloc(2, 0);
            signatureLength.writeInt16BE(message.localRecipients[recipient].length);
            this._clients[recipient].write(Buffer.concat([t, signatureLength, message.localRecipients[recipient], message.content]));
          }
          break;
      }
    });
  }
}
