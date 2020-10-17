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

import {BinaryLike, createCipheriv, createDecipheriv, randomBytes} from 'crypto';
import {Socket}                                                    from 'net';
import {Observable, Subject}                                       from 'rxjs';
import {SYMMETRIC}                                                 from '../constants/crypto-algorithms';
import {makeWriteP}                                                from '../socket';

/**
 *
 */
export abstract class CommonTitpClient {
  protected abstract _key: Buffer;
  protected _write?: (data: (Uint8Array | string)) => Promise<void>;
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
      const decrypted = CommonTitpClient.decrypt(data, this._key);
      this._onData.next(decrypted);
    });
  }

  /**
   * Encrypts the given data using a 384 bit key.
   * The decryption expects the incoming data to be properly formatted.
   * @param data The data to be decrypted.
   * @param key The 384 bit key to be used for the decryption.
   */
  public static decrypt(data: Buffer, key: Buffer): Buffer {
    const ivB = data.slice(0, 16);
    const encB = data.slice(16);
    const decipherB = createDecipheriv(SYMMETRIC, key.slice(24), ivB);
    const decB = Buffer.concat([decipherB.update(encB), decipherB.final()]);
    const ivA = decB.slice(0, 16);
    const encA = decB.slice(16);
    const decipherA = createDecipheriv(SYMMETRIC, key.slice(0, 24), ivA);
    return Buffer.concat([decipherA.update(encA), decipherA.final()]);
  }

  /**
   * Encrypts the given data using a 384 bit key.
   * The encryption is performed by applying aes-192 twice, with two varying initialization vectors.
   * @param data The data to be encrypted.
   * @param key
   * @param config
   */
  public static encrypt(data: BinaryLike, key: Buffer, config?: { iv?: Buffer }): Buffer {
    const ivA = config?.iv?.slice(0, 16) || randomBytes(16);
    const ivB = config?.iv?.slice(16) || randomBytes(16);
    const keyA = key.slice(0, 24);
    const keyB = key.slice(24);
    const cipherA = createCipheriv(SYMMETRIC, keyA, ivA);
    const cipherB = createCipheriv(SYMMETRIC, keyB, ivB);
    const encA = Buffer.concat([ivA, cipherA.update(data), cipherA.final()]);
    const encB = Buffer.concat([cipherB.update(encA), cipherB.final()]);
    return Buffer.concat([ivB, encB]);
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
    const enc = CommonTitpClient.encrypt(data, this._key);
    return this._write!(enc);
  }
}
