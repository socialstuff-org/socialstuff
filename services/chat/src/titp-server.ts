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

import {TitpServer}                                               from '@trale/transport/server';
import {UserKeyRegistry}                                          from '@trale/transport/user-key-registry';
import {CURVE}                                                    from '@trale/transport/constants/crypto-algorithms';
import {createECDH, createPrivateKey, createPublicKey, KeyObject} from 'crypto';
import * as fs                                                    from 'fs';
import axios                                                      from 'axios';
import * as path                                                  from 'path';
import {DataResponse}                                             from '@socialstuff/utilities/responses';

let rsa: {
  pub: KeyObject,
  priv: KeyObject,
};

const rsaPrivateKeyPath = path.join(__dirname, '..', '..', 'priv.pem');

const priv = fs.readFileSync(rsaPrivateKeyPath).toString('utf-8');
rsa = {
  priv: createPrivateKey(priv),
  pub:  createPublicKey(priv),
};

const rsaKeys: { [key: string]: KeyObject } = {
  root: rsa.pub,
};

const userKeyRegistry: UserKeyRegistry = {
  async fetchRsa(username: string) {
    if (rsaKeys[username]) {
      return rsaKeys[username];
    }
    const response = await axios.get<DataResponse<{ public_key: string }>>(process.env.SOCIALSTUFF_IDENTITY_ENDPOINT + '/public-key-of/' + username);
    const key = createPublicKey(response.data.data.public_key);
    rsaKeys[username] = key;
    return key;
  },
};

const ecdh = createECDH(CURVE);
ecdh.generateKeys();

export const server = new TitpServer(rsa, ecdh, userKeyRegistry);
