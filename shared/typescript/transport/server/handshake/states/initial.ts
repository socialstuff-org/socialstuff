// This file is part of the TITP.99
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

import {createSign}      from 'crypto';
import {fromEvent}       from 'rxjs';
import {Handshake}       from '../index';
import {HandshakeState}  from '../state';
import {WaitForUsername} from './wait-for-username';

const ECDH_END_INDEX = 97;
const ECDH_SIG_END_INDEX = ECDH_END_INDEX + 512;

export class Initial implements HandshakeState {
  enter(handshake: Handshake) {
    let dataBuffer = Buffer.alloc(0);
    const sub = fromEvent<Buffer>(handshake.socket, 'data').subscribe(async data => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
      if (dataBuffer.length < (ECDH_SIG_END_INDEX - 1)) {
        return;
      }
      handshake._ecdhPub = dataBuffer.slice(0, ECDH_END_INDEX);
      handshake._ecdhSig = dataBuffer.slice(ECDH_END_INDEX, ECDH_SIG_END_INDEX);

      handshake._syncKey = handshake.ecdh.computeSecret(handshake._ecdhPub).slice(0, 32);
      const reply: Buffer[] = [handshake.ecdh.getPublicKey()];
      {
        const signer = createSign('RSA-SHA512');
        signer.update(handshake.ecdh.getPublicKey());
        const serverEcdhSig = signer.sign(handshake.rsa.priv);
        reply.push(serverEcdhSig);
      }
      await handshake._write(Buffer.concat(reply));
      sub.unsubscribe();
      handshake._goToState(new WaitForUsername());
    });
  }
}
