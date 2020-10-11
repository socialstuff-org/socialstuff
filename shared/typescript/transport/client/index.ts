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
import {Observable, fromEvent} from 'rxjs';
import {promisify}             from 'util';
import {
  createCipheriv,
  createPrivateKey,
  createPublicKey,
  createSign, createVerify,
  ECDH,
  KeyObject,
  publicEncrypt,
  randomBytes,
}                              from 'crypto';
import {makeWriteP}            from '../socket';


export class TitpClient {
  private _socket: Socket = new Socket();
  private _rsa: { priv: KeyObject, pub: KeyObject };
  private _ecdh: ECDH;
  private _write: (data: (Uint8Array | string)) => Promise<void>;
  private _username: string;
  private _syncKey: Buffer = Buffer.alloc(0, 0);

  constructor(username: string, rsa: { priv: KeyObject, pub: KeyObject } | string, ecdh: ECDH) {
    if (typeof rsa === 'string') {
      this._rsa = {
        pub:  createPublicKey(rsa),
        priv: createPrivateKey(rsa),
      };
    } else {
      this._rsa = rsa;
    }
    this._ecdh = ecdh;
    this._write = makeWriteP(this._socket);
    this._username = username;
  }

  public rsaPublicKey() {
    return this._rsa.pub;
  }

  public async connect(hostRsaPub: KeyObject, host: string, port: number = 8086) {
    const messageBuffer: Buffer[] = [];
    await promisify<number, string>(this._socket.connect.bind(this._socket))(port, host);
    const signer = createSign('RSA-SHA512');
    signer.update(this._ecdh.getPublicKey());
    const signedEcdh = signer.sign(this._rsa.priv);
    const usernameKey = randomBytes(32);
    const usernameIv = randomBytes(16);
    const usernameKeyEnc = publicEncrypt(hostRsaPub, Buffer.concat([usernameKey, usernameIv]));
    const paddedUsername = this._username.padEnd(20, ' ');
    const cipher = createCipheriv('aes-256-cbc', usernameKey, usernameIv);
    const usernameEnc = Buffer.concat([cipher.update(paddedUsername), cipher.final()]);
    messageBuffer.push(this._ecdh.getPublicKey());
    messageBuffer.push(signedEcdh);
    messageBuffer.push(usernameKeyEnc);
    messageBuffer.push(usernameEnc);

    const message = Buffer.concat(messageBuffer);
    await this._write(message);
    return new Promise((res, rej) => {
      let dataBuffer = Buffer.alloc(0);
      const sub = fromEvent<Buffer>(this._socket, 'data').subscribe(data => {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        if (dataBuffer.length < 609) {
          return;
        }
        const ecdhPub = dataBuffer.slice(0, 97);
        const ecdhSig = dataBuffer.slice(97, 609);
        const verifier = createVerify('RSA-SHA512');
        verifier.update(ecdhPub);
        const signatureMatches = verifier.verify(hostRsaPub, ecdhSig);
        if (!signatureMatches) {
          sub.unsubscribe();
          rej('Signature mismatch!');
          return;
        }
        this._syncKey = this._ecdh.computeSecret(ecdhPub);
        sub.unsubscribe();
        res();
      });
    });
  }

  public on(event: string): Observable<any> {
    return new Observable<any>();
  }
}
