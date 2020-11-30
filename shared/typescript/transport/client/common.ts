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

import {BinaryLike}          from 'crypto';
import {Socket}              from 'net';
import {Observable, Subject} from 'rxjs';
import {decrypt, encrypt}    from '../crypto';
import {makeWriteP}          from '../socket';

/**
 *
 */
export abstract class CommonTitpClient {
  protected abstract _key: Buffer;
  protected _write: (data: (Uint8Array | string)) => Promise<void>;
  protected _onData = new Subject<Buffer>();

  protected constructor(protected _username: string, protected _socket: Socket) {
    this._write = makeWriteP(this._socket);
  }


  /**
   * Exposes the negotiated key for the communication channel.
   */
  public key() {
    return this._key;
  }

  /**
   * Returns the username of the user behind the connection.
   */
  public username() {
    return this._username;
  }

  /**
   * This method is used to initialize the client with steps which cannot be taken during the object construction.
   * @protected
   */
  protected _init(): void {
    this._socket.on('data', data => {
      const decrypted = decrypt(data, this._key);
      this._onData.next(decrypted);
    });
  }

  /**
   * Returns an {Observable<Buffer>} which provides a series of decrypted data the client received from the server.
   */
  public data(): Observable<Buffer> {
    return this._onData;
  }

  /**
   * Encrypts the given data and sends it to the connected server.
   * @param data The data to be sent.
   */
  public write(data: BinaryLike): Promise<void> {
    const enc = encrypt(data, this._key);
    return this._write(enc);
  }
}
