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

import {delay}                                                                  from '@socialstuff/utilities/common';
import {generateRsaKeyPair}                                                     from '@socialstuff/utilities/security';
import {createECDH, createPrivateKey, createPublicKey, createVerify, KeyObject} from 'crypto';
import fs                                                                       from 'fs';
import path                                                                     from 'path';
import {TitpClient}                                                             from '../client';
import {decryptAes384, decryptRsa}                                              from '../crypto';
import {
  buildServerMessage,
  ChatMessage,
  ChatMessageType,
  deserializeChatMessage,
  serializeServerMessage,
  ServerMessageType,
}                                                                               from '../message';
import {TitpServer}                                                             from '../server';
import {TitpClientBus}                                                          from '../server/client-bus';
import {UserKeyRegistry}                                                        from '../user-key-registry';

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

  const clientBus = new TitpClientBus('localhost:8086');

  const userKeyRegistry: UserKeyRegistry = {
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
    return new TitpClient('alice', rsa, ecdh);
  })();
  const bob = await (async () => {
    const rsa = await loadOrGenerateKeys('bob');
    const ecdh = createECDH('secp384r1');
    ecdh.generateKeys();
    return new TitpClient('bob', rsa, ecdh);
  })();

  userRsaKeys['alice'] = alice.rsaPublicKey();
  // userRsaKeys['alice'] = alice.rsaPublicKey();
  userRsaKeys['bob'] = bob.rsaPublicKey();
  // userRsaKeys['bob'] = bob.rsaPublicKey();

  await server.listen({host: '::', port: 8444});
  console.log('server running');

  const aliceKeys = await loadOrGenerateKeys('alice');
  const bobKeys = await loadOrGenerateKeys('bob');

  const source = await fs.promises.readFile(path.join(__dirname, 'playground.ts'));

  const conversationKey = Buffer.alloc(48, 0);

  await bob.connect(server.rsaPublicKey(), '::1', 8444);

  bob.data().subscribe(async x => {
    console.log('bob got data!');
    const messageType: ServerMessageType = x.readInt16BE();
    switch (messageType) {
      case ServerMessageType.chatMessage:
        const signatureLength = x.readInt16BE(2);
        console.log('received length:', signatureLength);
        const signature = decryptRsa(x.slice(4, signatureLength + 4), bobKeys.priv);
      {
        const senderNameLength = signature.readInt16BE();
        const senderName = signature.slice(2, 2 + senderNameLength).toString('utf-8');
        const senderNameSignature = signature.slice(2 + senderNameLength);
        const senderRsa = await userKeyRegistry.fetchRsa(senderName);
        {
          const verifier = createVerify('RSA-SHA512');
          verifier.update(senderName);
          if (!verifier.verify(senderRsa, senderNameSignature)) {
            throw new Error('Sender verification failed!');
          }
        }
      }
        const messageBuffer = x.slice(signatureLength + 4);
        const message = deserializeChatMessage(decryptAes384(messageBuffer, conversationKey));
        console.log('bob received message:', message);
        if (message.type === ChatMessageType.text) {
          console.log('with text content:', message.content.toString('utf-8'));
        }
        break;
    }
  });

  await alice.connect(server.rsaPublicKey(), '127.0.0.1', 8444);
  console.log('Playground> alice is now connected');
  await delay(1000);

  const message: ChatMessage = {
    senderName: 'alice@localhost:8086',
    sentAt: new Date(),
    type: ChatMessageType.text,
    content: Buffer.from('Hello, World! This is a chat message!'),
    attachments: []
  };
  const serverMessage = buildServerMessage(message, aliceKeys.priv, conversationKey, [
    {
      publicKey: bob.rsaPublicKey(),
      name: 'bob@localhost:8086'
    }
  ]);
  const serializedServerMessage = serializeServerMessage(serverMessage);
  alice.write(serializedServerMessage);
})();
