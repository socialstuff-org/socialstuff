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

import {delay}                                                    from '@socialstuff/utilities/common';
import {generateRsaKeyPair}                                       from '@socialstuff/utilities/security';
import {createECDH, createPrivateKey, createPublicKey, KeyObject} from 'crypto';
import fs                                                         from 'fs';
import path                                                       from 'path';
import {TitpClient}                                               from '../client';
import {Message, MessageType}                                     from '../message';
import {TitpServer}                                               from '../server';
import {TitpClientBus}                                            from '../server/client-bus';

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

  const clientBus = new TitpClientBus();

  const server = await (async () => {
    const rsa = await loadOrGenerateKeys('server');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpServer(rsa, ecdh, {
      async fetchRsa(username: string) {
        const key = userRsaKeys[username];
        if (key) {
          return key;
        } else {
          throw new Error('Username unknown!');
        }
      },
    });
  })();

  server.newConnection().subscribe(con => {
    clientBus.pushClient(con);
  });

  const alice = await (async () => {
    const rsa = await loadOrGenerateKeys('alice');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpClient('alice', rsa, ecdh);
  })();
  const bob = await (async () => {
    const rsa = await loadOrGenerateKeys('bob');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpClient('bob', rsa, ecdh);
  })();

  userRsaKeys['alice'] = alice.rsaPublicKey();
  userRsaKeys['bob'] = bob.rsaPublicKey();

  await server.listen({ host: '::', port: 8444 });
  console.log('server running');

  alice.data().subscribe(x => {
    console.log(`Client> server sent: ${x.toString('utf8')}`);
    // await alice.end();
    // await server.close();
  });

  alice
    .connect(server.rsaPublicKey(), '127.0.0.1', 8444)
    .then(() => console.log('Playground> alice is now connected'))
    .then(() => delay(1000))
    .then(() => {
      console.log('Playground> sending message...');
      alice.write('Hello, World!');


      const m = new Message(MessageType.textMessage, ['foo@bar.com'], Buffer.from('Hello there, my friend!'));
      const sealed = m.seal(alice.key());
    });



})();
