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

import {ECDH, KeyObject}      from 'crypto';
import {Socket}               from 'net';
import {Subject}              from 'rxjs';
import {makeWriteP}           from '../../socket';
import {UserKeyRegistry}      from '../../user-key-registry';
import {TitpClientConnection} from '../client-connection';
import {HandshakeState}       from './state';
import {Initial}              from './states';

export class Handshake {
  public _ecdhPub = Buffer.alloc(0);
  public _ecdhSig = Buffer.alloc(0);
  public _syncKey = Buffer.alloc(0);
  public _write: ((data: Uint8Array | string) => Promise<void>);
  public _handshakeResult = new Subject<TitpClientConnection>();

  private _state: HandshakeState = new Initial();
  constructor(public socket: Socket, public ecdh: ECDH, public rsa: { priv: KeyObject, pub: KeyObject }, public _userKeyRegistry: UserKeyRegistry) {
    this._write = makeWriteP(socket);
    this._state.enter?.(this);
  }

  public _goToState(state: HandshakeState) {
    this._state.exit?.(this);
    this._state = state;
    this._state.enter?.(this);
  }
}
