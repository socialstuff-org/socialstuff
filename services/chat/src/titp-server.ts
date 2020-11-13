// This file is part of SocialStuff Chat.
//
// SocialStuff Chat is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Chat is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Chat.  If not, see <https://www.gnu.org/licenses/>.

import {TitpServer}                      from '@trale/transport/server';
import {}                                from '@trale/transport/client';
import {UserKeyRegistry}                 from '@trale/transport/user-key-registry';
import {CURVE}                                      from '@trale/transport/constants/crypto-algorithms';
import {createECDH, generateKeyPairSync, KeyObject} from 'crypto';

const _rsa = generateKeyPairSync('rsa', {modulusLength: 1024});
const rsa = {
  pub:  _rsa.publicKey,
  priv: _rsa.privateKey,
};

const rsaKeys: {[key: string]:KeyObject} = {

}

const userKeyRegistry: UserKeyRegistry = {
  async fetchRsa(username: string) {
    return rsaKeys[username];
  }
};

export const server = new TitpServer(rsa, createECDH(CURVE), userKeyRegistry);

(async() => {
  await server.listen({
    host: '::',
    port: 8088
  });
  console.log('TITP Server running.');
})();
