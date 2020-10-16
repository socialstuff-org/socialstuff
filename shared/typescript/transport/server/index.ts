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

import {Server, Socket}                                              from 'net';
import * as Rx                                                       from 'rxjs';
import {Observable, Subject}                                         from 'rxjs';
import {KeyObject, ECDH, createVerify, createSign, createDecipheriv} from 'crypto';
import {makeWriteP}                                                  from '../socket';
import {UserKeyRegistry}                                             from '../user-key-registry';
import {TitpClientConnection}                                        from './client-connection';

const ECDH_END_INDEX = 97;
const ECDH_SIG_END_INDEX = ECDH_END_INDEX + 512;

enum ClientServerHandshakeStep {
  ReceiveEcdh,
  ReceiveUsername
}

export type RsaUserLookupFunction = (username: string) => Promise<KeyObject>;

export class TitpServer {
  private _server: Server;
  private _ecdh: ECDH;
  private _rsa: { priv: KeyObject, pub: KeyObject };
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
    const con = await this._performHandshake(socket);
    console.log(`Server> new successful connection with user '${con.username()}'.`);
    this._newConnection.next(con);
  }

  public newConnection(): Observable<TitpClientConnection> {
    return this._newConnection;
  }

  private _performHandshake(s: Socket) {
    return new Promise<TitpClientConnection>((res, rej) => {
      let dataBuffer = Buffer.from([]);
      let step: ClientServerHandshakeStep = ClientServerHandshakeStep.ReceiveEcdh;
      let ecdhPub: Buffer;
      let ecdhSig: Buffer;
      let syncKey: Buffer;
      const write = makeWriteP(s);
      const dataSubscription = Rx.fromEvent<Buffer>(s, 'data').subscribe(async data => {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        switch (step) {
          case ClientServerHandshakeStep.ReceiveEcdh: {
            if (dataBuffer.length < (ECDH_SIG_END_INDEX - 1)) {
              return;
            }
            ecdhPub = dataBuffer.slice(0, ECDH_END_INDEX);
            ecdhSig = dataBuffer.slice(ECDH_END_INDEX, ECDH_SIG_END_INDEX);

            syncKey = this._ecdh.computeSecret(ecdhPub);
            const reply: Buffer[] = [this._ecdh.getPublicKey()];
            {
              const signer = createSign('RSA-SHA512');
              signer.update(this._ecdh.getPublicKey());
              const serverEcdhSig = signer.sign(this._rsa.priv);
              reply.push(serverEcdhSig);
            }
            await write(Buffer.concat(reply));
            dataBuffer = Buffer.alloc(0);
            step = ClientServerHandshakeStep.ReceiveUsername;
          }
            break;

          case ClientServerHandshakeStep.ReceiveUsername: {
            if (dataBuffer.length < 32) {
              return;
            }
            const decipher = createDecipheriv('aes-256-cbc', syncKey.slice(0, 32), syncKey.slice(32));
            const username = Buffer
              .concat([decipher.update(dataBuffer.slice(0, 32)), decipher.final()])
              .toString('utf8')
              .trimEnd();
            const userRsa = await this._userKeyRegistry.fetchRsa(username);
            {
              const verifier = createVerify('RSA-SHA512');
              verifier.update(ecdhPub);
              const signatureMatch = verifier.verify(userRsa, ecdhSig);
              if (!signatureMatch) {
                rej('The signature did not match!');
                s.end();
                dataSubscription.unsubscribe();
                return;
              }
            }
            dataSubscription.unsubscribe();
            res(new TitpClientConnection(s, username, syncKey));
          }
            break;
        }
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
