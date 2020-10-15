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

import {Server, Socket}                                                              from 'net';
import * as Rx                                                                       from 'rxjs';
import {Observable, Subject}                                                         from 'rxjs';
import {KeyObject, ECDH, createVerify, createSign, privateDecrypt, createDecipheriv} from 'crypto';
import {makeWriteP}                                                                  from '../socket';
import {UserKeyRegistry}                                                             from '../user-key-registry';
import {TitpClientConnection}                                                        from './client-connection';

const ECDH_END_INDEX = 97;
const ECDH_SIG_END_INDEX = ECDH_END_INDEX + 512;
const USERNAME_AES_KEY_END_INDEX = ECDH_SIG_END_INDEX + 512;
const USERNAME_END_INDEX = USERNAME_AES_KEY_END_INDEX + 32;

export type RsaUserLookupFunction = (username: string) => Promise<KeyObject>;

export class TitpServer {
  private _server: Server;
  private _ecdh: ECDH;
  private _rsa: { priv: KeyObject, pub: KeyObject };
  private _userSocks: { [key: string]: Socket } = {};
  private _userKeyRegistry: UserKeyRegistry;
  private _newConnection: Subject<TitpClientConnection> = new Subject<TitpClientConnection>();

  constructor(rsa: { priv: KeyObject, pub: KeyObject }, ecdh: ECDH, userKeyRegistry: UserKeyRegistry) {
    this._server = new Server(this._handleIncomingConnection.bind(this));
    this._ecdh = ecdh;
    this._rsa = rsa;
    this._userKeyRegistry = userKeyRegistry;
  }

  public rsaPublicKey() {
    return this._rsa.pub;
  }

  private async _handleIncomingConnection(socket: Socket) {
    const {username, ecdhPub} = await this._performHandshake(socket);
    this._userSocks[username] = socket;
    console.log(`Server> new successful connection with user '${username}'.`);
    const key = this._ecdh.computeSecret(ecdhPub);
    const con = new TitpClientConnection(socket, username, key);
    this._newConnection.next(con);
  }

  public newConnection(): Observable<TitpClientConnection> {
    return this._newConnection;
  }

  private _performHandshake(s: Socket) {
    return new Promise<{ username: string, ecdhPub: Buffer }>((res, rej) => {
      let dataBuffer = Buffer.from([]);
      const dataSubscription = Rx.fromEvent<Buffer>(s, 'data').subscribe(async data => {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        // console.log('new data length:', dataBuffer.length, '; required index:', USERNAME_END_INDEX);
        if (dataBuffer.length < (USERNAME_END_INDEX - 1)) {
          return;
        }
        const ecdhPub = dataBuffer.slice(0, ECDH_END_INDEX);
        const ecdhSig = dataBuffer.slice(ECDH_END_INDEX, ECDH_SIG_END_INDEX);
        const [usernameKey, usernameIv] = (() => {
          const usernameKeyBuffer = dataBuffer.slice(ECDH_SIG_END_INDEX, USERNAME_AES_KEY_END_INDEX);
          const decrypted = privateDecrypt(this._rsa.priv, usernameKeyBuffer);
          return [decrypted.slice(0, 32), decrypted.slice(32)];
        })();
        const usernameBytes = (() => {
          const username = dataBuffer.slice(USERNAME_AES_KEY_END_INDEX, USERNAME_END_INDEX);
          const decipher = createDecipheriv('aes-256-cbc', usernameKey, usernameIv);
          return Buffer.concat([decipher.update(username), decipher.final()]);
        })();
        const username = usernameBytes.toString('utf8').trimEnd();
        const userRsa = await this._userKeyRegistry.fetchRsa(username);
        {
          const verifier = createVerify('RSA-SHA512');
          verifier.update(ecdhPub);
          const signatureMatch = verifier.verify(userRsa, ecdhSig);
          if (!signatureMatch) {
            rej('The signature did not match!');
            dataSubscription.unsubscribe();
            return;
          }
        }

        const write = makeWriteP(s);
        const reply: Buffer[] = [this._ecdh.getPublicKey()];
        {
          const signer = createSign('RSA-SHA512');
          signer.update(this._ecdh.getPublicKey());
          const serverEcdhSig = signer.sign(this._rsa.priv);
          reply.push(serverEcdhSig);
        }

        await write(Buffer.concat(reply));
        dataSubscription.unsubscribe();
        res({username, ecdhPub});
      });
    });
  }

  // public on(event: 'connection'): Observable<TitpClient>;
  public on(event: string): Observable<any> {
    return new Observable<any>();
  }

  public listen(port: number, host: string = '0.0.0.0') {
    return new Promise<TitpServer>(res => {
      this._server.listen(port, host, () => res(this));
    });
  }

  public close() {
    return new Promise<void>((res, rej) => {
      this._server.close(e => ((e ? rej : res)(e as any)));
    });
  }
}
