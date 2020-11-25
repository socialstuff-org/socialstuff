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

import {createVerify}   from 'crypto';
import {fromEvent}      from 'rxjs';
import {SIGN}           from '../../../constants/crypto-algorithms';
import {encryptAes384}  from '../../../crypto';
import {Handshake}      from '../index';
import {HandshakeState} from '../state';

export class WaitForEcdh extends HandshakeState {
  enter(handshake: Handshake) {
    let dataBuffer = Buffer.alloc(0);
    const sub = fromEvent<Buffer>(handshake.socket, 'data').subscribe(async data => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
      if (dataBuffer.length < 609) {
        return;
      }
      sub.unsubscribe();
      const ecdhPub = dataBuffer.slice(0, 97);
      const ecdhSig = dataBuffer.slice(97, 609);
      const verifier = createVerify(SIGN);
      verifier.update(ecdhPub);
      const signatureMatches = verifier.verify(handshake.serverRsaPublicKey, ecdhSig);
      if (!signatureMatches) {
        handshake._handshakeResult.error(new Error('Signature mismatch!'));
        return;
      }
      handshake._syncKey = handshake.ecdh.computeSecret(ecdhPub);
      handshake._write(encryptAes384(handshake.username.padEnd(20, ' '), handshake._syncKey))
        .then(() => {
          handshake._handshakeResult.next();
          handshake._handshakeResult.complete();
        });
    });
  }
}
