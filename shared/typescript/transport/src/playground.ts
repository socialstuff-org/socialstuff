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
import {
  ChatMessage,
  ChatMessageType,
}                                                                 from '../message';
import {TitpServer}                                               from '../server';
import {TitpClientBus}                                            from '../server/client-bus';
import {UserKeyRegistry}                                          from '../user-key-registry';
import {ConversationKeyRegistry}                                  from '../conversation-key-registry';
import { enableLogging } from '../log';

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

enableLogging();

(async () => {
  const userRsaKeys: { [key: string]: KeyObject } = {};

  const clientBus = new TitpClientBus('localhost:8086');

  // @ts-ignore
  const userKeyRegistry: UserKeyRegistry & ConversationKeyRegistry = {
    async fetchRsa(username: string) {
      if (username.endsWith('@localhost:8086')) {
        username = username.split('@')[0];
      }
      const key = userRsaKeys[username];
      if (key) {
        return key;
      } else {
        throw new Error('Username unknown!');
      }
    },
    async fetchConversationKey(_username: string) {
      return Buffer.from('60742da6258b25275294fcef3229efa0769534c6dd98f31697a6d8c8f5ecb1d2', 'hex');
    },
  };

  const server = await (async () => {
    const rsa = await loadOrGenerateKeys('server');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpServer(rsa, ecdh, userKeyRegistry);
  })();

  server.newConnection().subscribe(con => {
    clientBus.pushClient(con);
  });

  const alice = await (async () => {
    const rsa = await loadOrGenerateKeys('alice');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpClient('alice', rsa, ecdh, userKeyRegistry);
  })();
  const bob = await (async () => {
    const rsa = await loadOrGenerateKeys('bob');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpClient('bob', rsa, ecdh, userKeyRegistry);
  })();

  userRsaKeys['alice'] = alice.rsaPublicKey();
  userRsaKeys['bob'] = bob.rsaPublicKey();

  await server.listen({host: '::', port: 8444});
  console.log('server running');

  await bob.connect(server.rsaPublicKey(), '::1', 8444);

  bob.incomingMessage().subscribe(message => {
    switch (message.type) {
      case ChatMessageType.text:
        console.log(`bob got a message from ${message.senderName}: ${message.content.toString('utf8')}`);
        if (message.groupId) {
          console.log(`this message is sent to the group '${message.groupId}'`);
        }
    }
    alice.end();
    bob.end();
    server.close();
  });

  await alice.connect(server.rsaPublicKey(), '127.0.0.1', 8444);
  console.log('Playground> alice is now connected');
  await delay(1000);

  const message: ChatMessage = {
    senderName:  'alice@localhost:8086',
    sentAt:      new Date(),
    type:        ChatMessageType.text,
    content:     Buffer.from('Hello, World! This is a chat message!'),
    attachments: [],
    groupId:     'someGroup',
  };

  alice.sendChatMessageTo(message, ['bob@localhost:8086']);
})();
