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

import {Socket}                from 'net';
import {CommonTitpClient}      from '../client/common';
import {fromEvent, Observable} from 'rxjs';


export class TitpClientConnection extends CommonTitpClient {
  constructor(socket: Socket, username: string, protected _key: Buffer) {
    super(username, socket);
    this._init();
  }

  public on(event: 'close'): Observable<boolean>;
  public on(event: string): Observable<any> {
    switch (event) {
      case 'close':
        return fromEvent(this._socket, 'close');
    }
    throw new Error(`Unknown event '${event}'!`);
  }
}
