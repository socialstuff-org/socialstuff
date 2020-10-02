// This file is part of SocialStuff Identity.
//
// SocialStuff Identity is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Identity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

import bodyParser                            from 'body-parser';
import express                               from 'express';
import util                                  from 'util';
import bootstrap                             from './bootstrap';
import router                                from './router';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';

const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

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

  app.use('/', router);

  try {
    const appListen: (port: number, host: string) => Promise<void> = util.promisify(app.listen.bind(app));
    await appListen(APP_PORT, APP_HOST);
  } catch (err) {
    console.error(err);
    return;
  }
  console.log(`Social Stuff Identity service running on ${APP_HOST}:${APP_PORT}.`);
})();

