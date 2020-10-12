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

import fs                                                                     from 'fs';
import path                                                                   from 'path';
import {createECDH, createPrivateKey, createPublicKey, getCiphers, KeyObject} from 'crypto';
import {generateRsaKeyPair}                                                   from '@socialstuff/utilities/security';
import {TitpClient}                                                           from '../client';
import {TitpServer}                                                           from '../server';
import {delay}                                                                from '@socialstuff/utilities/common';

async function loadOrGenerateKeys(name: string, mod: number = 4096) {
  let exists;
  try {
    await fs.promises.stat(path.join(__dirname, name + '.priv.pem'));
    exists = true;
  } catch (e) {
    exists = false;
  }
  if (exists) {
    const privString = await fs.promises.readFile(path.join(__dirname, name + '.priv.pem'));
    return {
      pub:  createPublicKey(privString),
      priv: createPrivateKey(privString),
    };
  } else {
    const keys = await generateRsaKeyPair(mod);
    await fs.promises.writeFile(path.join(__dirname, name + '.priv.pem'), keys.priv.export({
      type:   'pkcs1',
      format: 'pem',
    }));
    return keys;
  }
}

(async () => {
  const userRsaKeys: { [key: string]: KeyObject } = {};

  const server = await (async () => {
    const rsa = await loadOrGenerateKeys('server');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpServer(rsa, ecdh, async x => {
      const key = userRsaKeys[x];
      if (key) {
        return key;
      } else {
        throw new Error('Username unknown!');
      }
    });
  })();

  const alice = await (async () => {
    const aliceRsa = await loadOrGenerateKeys('alice');
    const a = createECDH('secp384r1');
    a.generateKeys();
    return new TitpClient('alice', aliceRsa, a);
  })();

  userRsaKeys['alice'] = alice.rsaPublicKey();

  await server.listen(8444);
  console.log('server running');
  alice.connect(server.rsaPublicKey(), '127.0.0.1', 8444).then(async () => {
    console.log('alice is now connected');
    await delay(1000);
    console.log('Client> sending message...');
    await alice.write('Hello, World!');
  });

  alice.data().subscribe(x => {
    console.log(`Client> server sent: ${x.toString('utf8')}`);
  });

})();
