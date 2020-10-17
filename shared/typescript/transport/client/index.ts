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

import {Socket}                                             from 'net';
import {promisify}                                          from 'util';
import {createPrivateKey, createPublicKey, ECDH, KeyObject} from 'crypto';
import {CommonTitpClient}                                   from './common';
import {Handshake}                                          from './handshake';

export class TitpClient extends CommonTitpClient {
  private _rsa: { priv: KeyObject, pub: KeyObject };
  private _ecdh: ECDH;
  protected _key: Buffer = Buffer.alloc(0, 0);

  /**
   *
   * @param username
   * @param rsa The RSA key-pair of the user. If only a string is provided, it is assumed to be the private key, as the the key-pair will be generated from that string.
   * @param ecdh
   */
  constructor(username: string, rsa: { priv: KeyObject, pub: KeyObject } | string, ecdh: ECDH) {
    super(username, new Socket());
    if (typeof rsa === 'string') {
      this._rsa = {
        pub:  createPublicKey(rsa),
        priv: createPrivateKey(rsa),
      };
    } else {
      this._rsa = rsa;
    }
    this._ecdh = ecdh;
  }

  /**
   * Returns the RSA public key of the user.
   */
  public rsaPublicKey() {
    return this._rsa.pub;
  }

  /**
   *
   * @param hostRsaPub
   * @param host
   * @param port
   */
  public async connect(hostRsaPub: KeyObject, host: string, port: number = 8086) {
    await promisify<number, string>(this._socket.connect.bind(this._socket))(port, host);
    const handshake = new Handshake(this._username, this._socket, this._ecdh, this._rsa, hostRsaPub);
    await handshake._handshakeResult.toPromise();
    this._key = handshake._syncKey;
    this._init();
  }

  public end() {
    return new Promise(res => {
      this._socket.end(() => {
        this._socket.destroy();
        res();
      });
    });
  }
}
