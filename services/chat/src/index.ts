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
import {server} from './titp-server';

const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '127.0.0.1';
const TRALE_PORT = parseInt(process.env.TRALE_PORT || '3002');

(async () => {
  await bootstrap;
  const app = express();

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
    await server.listen({ host: APP_HOST, port: TRALE_PORT });
    console.log(`Trale Server running on host ${APP_HOST} and port ${TRALE_PORT}.`);
  } catch {
    console.error(`Could not bind Trale server to port ${TRALE_PORT}!`);
    process.exit(1);
  }

  server.newConnection().subscribe(x => {
    console.log('new connection from:', x.username());
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
