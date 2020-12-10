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

import bodyParser                            from 'body-parser';
import bootstrap                             from './bootstrap';
import express                               from 'express';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';
import util                                  from 'util';
import {server}                              from './titp-server';
import {TitpClientBus}                       from '@trale/transport/server/client-bus';
import {sharedConnection}                    from './mongodb';
import {hashHmac}                            from '@socialstuff/utilities/security';
import { Binary } from 'mongodb';

const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '::1';
const TRALE_PORT = parseInt(process.env.TRALE_PORT || '3002');

(async () => {
  await bootstrap;
  const app = express();
  const mongoConnection = await sharedConnection();
  const db = mongoConnection.db('messages', { returnNonCachedInstance: true });
  const messages = db.collection('messages');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(injectProcessEnvironmentIntoRequest as express.Handler);
  app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });

  // app.post('/foo', foo);
  try {
    await server.listen({host: APP_HOST, port: TRALE_PORT});
    console.log(`Trale Server running on host ${APP_HOST} and port ${TRALE_PORT}.`);
  } catch {
    console.error(`Could not bind Trale server to port ${TRALE_PORT}!`);
    process.exit(1);
  }

  const bus = new TitpClientBus(process.env.APP_HOSTNAME + ':' + TRALE_PORT);

  server.newConnection().subscribe(async x => {
    bus.pushClient(x);
    const usernameHash = hashHmac(x.username().split('@')[0]);
    console.log('username:', x.username().split('@')[0], ';hash:', usernameHash);
    const pendingMessages = await messages.findOne<{ messages: Binary[] }>({ username: usernameHash });
    if (pendingMessages === null) {
      await messages.insertOne({ username: usernameHash, messages: [] });
    } else if (pendingMessages.messages.length) {
      const pendingSends = pendingMessages.messages.map(y => x.write(y.buffer));
      await Promise.all(pendingSends);
      await messages.updateOne({ username: usernameHash }, { $set: { messages: [] } });
    }
  });

  bus.onForwardToOfflineUsers.subscribe(async offlineUsers => {
    console.log('saving due to offline users');
    for (const u of offlineUsers) {
      const recipient = u.recipient.split('@')[0];
      const recipientHash = hashHmac(recipient);
      const recipientHasDocument = await messages.findOne({ username: recipientHash });
      if (!recipientHasDocument) {
        await messages.insertOne({ username: recipientHash, messages: [u.message] });
      } else {
        await messages.updateOne({ username: recipientHash }, { $push: { messages: u.message } });
      }
    }
  });

  try {
    const appListen: (port: number, host: string) => Promise<void> = util.promisify(app.listen.bind(app));
    await appListen(APP_PORT, APP_HOST);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
  console.log(`Social Stuff Chat service running on host ${APP_HOST} and port ${APP_PORT}.`);
})();
