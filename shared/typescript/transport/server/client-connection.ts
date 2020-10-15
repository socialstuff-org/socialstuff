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

import {Socket}                                       from 'net';
import {BinaryLike, createCipheriv, createDecipheriv} from 'crypto';
import {makeWriteP}                     from '../socket';
import {fromEvent, Observable, Subject} from 'rxjs';


export class TitpClientConnection {
  private _socket: Socket;
  private readonly _username: string;
  private readonly _write: (data: (Uint8Array | string)) => Promise<void>;
  private readonly _key: Buffer;
  private readonly _data: Subject<Buffer> = new Subject<Buffer>();
  private _dataBuffer = Buffer.alloc(0);

  constructor(socket: Socket, username: string, key: Buffer) {
    this._socket = socket;
    this._username = username;
    this._write = makeWriteP(socket);
    this._key = key;
    this._socket.on('data', data => {
      this._dataBuffer = Buffer.concat([this._dataBuffer, data]);
      if (socket.writableLength) {
        return;
      }
      const decipher = createDecipheriv('aes-256-cbc', this._key.slice(0, 32), this._key.slice(32));
      const result = Buffer.concat([decipher.update(this._dataBuffer), decipher.final()]);
      this._data.next(result);
    });
  }

  public on(event: 'close'): Observable<boolean>;
  public on(event: string): Observable<any> {
    switch (event) {
      case 'close':
        return fromEvent(this._socket, 'close');
    }
    throw new Error(`Unknown event '${event}'!`);
  }

  public data(): Observable<Buffer> {
    return this._data;
  }

  public username() {
    return this._username;
  }

  public key() {
    return this._key;
  }

  public write(data: BinaryLike) {
    const cipher = createCipheriv('aes-256-cbc', this._key.slice(0, 32), this._key.slice(32));
    const enc = Buffer.concat([cipher.update(data), cipher.final()]);
    return this._write(enc);
  }
}
