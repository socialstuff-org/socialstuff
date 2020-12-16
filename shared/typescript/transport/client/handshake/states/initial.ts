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

import {createSign}     from "crypto";
import {SIGN}           from '../../../constants/crypto-algorithms';
import { prefix } from "../../../log";
import {Handshake}      from '../index';
import {HandshakeState} from '../state';
import {WaitForEcdh}    from './wait-for-ecdh';

const log = prefix('@trale/transport/client/handshake/states/initial');

export class Initial extends HandshakeState {
  enter(handshake: Handshake) {
    const messageBuffer: Buffer[] = [];
    const signer = createSign(SIGN);
    signer.update(handshake.ecdh.getPublicKey());
    const signedEcdh = signer.sign(handshake.rsa.priv);
    messageBuffer.push(handshake.ecdh.getPublicKey());
    messageBuffer.push(signedEcdh);
    const message = Buffer.concat(messageBuffer);
    log('send ecdh data');
    handshake._write(message)
      .then(() => {
        handshake._goToState(new WaitForEcdh());
      });
  }
}
