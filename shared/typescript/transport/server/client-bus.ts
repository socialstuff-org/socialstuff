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

import {BinaryLike}           from 'crypto';
import {TitpClientConnection} from './client-connection';

export class TitpClientBus {
  private _clients: { [username: string]: TitpClientConnection } = { };

  public pushClient(client: TitpClientConnection) {
    this._registerNewClient(client);
  }

  private _registerNewClient(client: TitpClientConnection) {
    this._clients[client.username()] = client;
    client.on('close').subscribe(() => {
      delete this._clients[client.username()];
    });
    client.data().subscribe(x => {
      console.log('Some Data> ' + x.toString('utf-8'));
    })
  }

  public async forwardMessageTo(username: string, message: BinaryLike) {
    const client = this._clients[username];
    if (!client) {
      // TODO persist message
      return;
    } else {
      await client.write(message);
    }
  }
}
