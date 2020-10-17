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

import {ListenOptions, Server, Socket} from 'net';
import {Observable, Subject}           from 'rxjs';
import {KeyObject, ECDH}               from 'crypto';
import {UserKeyRegistry}               from '../user-key-registry';
import {TitpClientConnection}          from './client-connection';
import {Handshake}                     from './handshake';

/**
 * The TitpServer is responsible for allowing users to connect to their relay server.
 * It will perform the TITP handshake and yield new proper connections.
 *
 * However, this server is not responsible for the forwarding and delivery of data, except for the handshake!
 * To transfer data between clients, please have a look at other transport modules in this library.
 */
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

  /**
   * Returns the RSA public key of the user.
   */
  public rsaPublicKey() {
    return this._rsa.pub;
  }

  /**
   * Handles new incoming connections.
   * @param socket The newly connected socket.
   * @private
   */
  private async _handleIncomingConnection(socket: Socket) {
    const handshake = new Handshake(socket, this._ecdh, this._rsa, this._userKeyRegistry);
    const con = await handshake._handshakeResult.toPromise();
    console.log(`Server> new successful connection with user '${con.username()}'.`);
    this._newConnection.next(con);
  }

  /**
   * Returns an Observable, which only yields new connection with a successful handshake.
   */
  public newConnection(): Observable<TitpClientConnection> {
    return this._newConnection;
  }

  /**
   * Binds the server to the specified endpoint and starts listening.
   * @param options
   */
  public listen(options: ListenOptions = {port: 8086, host: '::'}) {
    return new Promise<TitpServer>(res => {
      this._server.listen(options, () => res(this));
    });
  }

  /**
   * Closes the server and stops it from allowing any further connections.
   */
  public close() {
    return new Promise<void>((res, rej) => {
      this._server.close(e => ((e ? rej : res)(e as any)));
    });
  }
}
