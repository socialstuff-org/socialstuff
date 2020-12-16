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

import {createVerify}         from 'crypto';
import {fromEvent}            from 'rxjs';
import {SIGN}                 from '../../../constants/crypto-algorithms';
import {decrypt}              from '../../../crypto';
import { prefix } from '../../../log';
import {TitpClientConnection} from '../../client-connection';
import {Handshake}            from '../index';
import {HandshakeState}       from '../state';

const log = prefix('@trale/transport/server/handshake/state/wait-for-username');

export class WaitForUsername implements HandshakeState {
  enter(handshake: Handshake) {
    let dataBuffer = Buffer.alloc(0);
    const sub = fromEvent<Buffer>(handshake.socket, 'data').subscribe(async data => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
      if (dataBuffer.length < 80) {
        return;
      }
      log('got username bytes');
      data = dataBuffer.slice(0, 80);
      sub.unsubscribe();
      const usernameBytes = decrypt(data, handshake._syncKey);
      const username = usernameBytes.toString('utf-8').trimEnd();
      const userRsa = await handshake._userKeyRegistry.fetchRsa(username);
      log('verifying signature for user', username);
      {
        const verifier = createVerify(SIGN);
        verifier.update(handshake._ecdhPub);
        const signatureMatch = verifier.verify(userRsa, handshake._ecdhSig);
        if (!signatureMatch) {
          log('signature mismatch for user', username);
          handshake._handshakeResult.error(new Error('The signature did not match!'));
          return;
        }
      }
      const con = new TitpClientConnection(handshake.socket, username, handshake._syncKey);
      log('established new connection with', con.username());
      handshake._handshakeResult.next(con);
      handshake._handshakeResult.complete();
    });
  }
}
