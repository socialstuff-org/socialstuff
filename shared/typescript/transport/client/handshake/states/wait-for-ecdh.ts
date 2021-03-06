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

import { createVerify } from 'crypto';
import { fromEvent } from 'rxjs';
import { SIGN } from '../../../constants/crypto-algorithms';
import { encrypt } from '../../../crypto';
import { prefix } from '../../../log';
import { Handshake } from '../index';
import { HandshakeState } from '../state';

const log = prefix('@trale/transport/client/handshake/states/wait-for-ecdh');

const maxUsernameLength = 60;

export class WaitForEcdh extends HandshakeState {
  enter(handshake: Handshake) {
    let dataBuffer = Buffer.alloc(0);
    const sub = fromEvent<Buffer>(handshake.socket, 'data').subscribe(async data => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
      if (dataBuffer.length < 609) {
        return;
      }
      log('got ecdh')
      sub.unsubscribe();
      const ecdhPub = dataBuffer.slice(0, 97);
      const ecdhSig = dataBuffer.slice(97, 609);
      const verifier = createVerify(SIGN);
      verifier.update(ecdhPub);
      const signatureMatches = verifier.verify(handshake.serverRsaPublicKey, ecdhSig);
      if (!signatureMatches) {
        log('signatures didn\'t match!');
        handshake._handshakeResult.error(new Error('Signature mismatch!'));
        return;
      }
      handshake._syncKey = handshake.ecdh.computeSecret(ecdhPub).slice(0, 32);
      const usernameBuffer = Buffer.from(handshake.username.padEnd(maxUsernameLength, ' '), 'utf-8');
      if (usernameBuffer.length > maxUsernameLength) {
        log('username buffer was too long! username:', handshake.username);
        throw new Error(`the binary encoded username may not be londer than ${maxUsernameLength} bytes!`);
      }
      handshake._write(encrypt(usernameBuffer, handshake._syncKey))
        .then(() => {
          handshake._handshakeResult.next();
          handshake._handshakeResult.complete();
        });
    });
  }
}
