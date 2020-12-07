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

/* istanbul ignore file */

import crypto                                                from 'crypto';
import path                                                  from 'path';
// @ts-ignore
import customEnv                                             from 'custom-env';
import {v1}                                                  from 'uuid';
import fs                                                    from 'fs';
import {createConnection, rebuildDatabase, sharedConnection} from './mysql';
import {delay}                                               from '@socialstuff/utilities/common';

const ENV = process.env.NODE_ENV || 'dev';
customEnv.env();
customEnv.env(ENV);

export default (async () => {
  if (ENV === 'test') {
    return;
  }

  {
    let retryConnection = true;
    while (retryConnection) {
      try {
        await createConnection();
        retryConnection = false;
      } catch (e) {
        console.error('retrying initial connection...', e);
        await delay(1000);
      }
    }
  }

  const keysPath = path.join(__dirname, '..', '..', 'priv.pem');
  {
    if (!fs.existsSync(keysPath)) {
      const keys = crypto.generateKeyPairSync('rsa', {modulusLength: 4096});
      fs.writeFileSync(keysPath, keys.privateKey.export({format: 'pem', type: 'pkcs1'}));
      fs.writeFileSync(path.join(__dirname, '..', 'pub.pem'), keys.publicKey.export({format: 'pem', type: 'pkcs1'}));
    }
  }

  // const serverPublicRsaString = fs.readFileSync(keysPath).toString('utf-8');
  // const serverRsaPublicKey = createPublicKey(serverPublicRsaString);

  // TODO add rsa keys to version control

  const db = await createConnection({ multipleStatements: true });

  if (ENV !== 'dev') {
    return;
  }

  const ecdh = crypto.createECDH('secp256k1');
  ecdh.generateKeys();
  process.env.ECDH_PRIVATE_KEY = ecdh.getPrivateKey().toString('base64');

  console.log('Setting up database...');
  await rebuildDatabase();
  console.log('Database ready for use!');
  console.log('seeding some data...');
  for (let i = 0; i < 5; ++i) {
    const id = v1().replace(/-/g, '');
    //const token = await hashHmac(id);
    //await db.query('INSERT INTO registration_invites (secret, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY));', [token]);
    console.log('sample invite code:      ', id);
  }
  await db.end();
  await sharedConnection();
  console.log('finished db initialization');
})();
