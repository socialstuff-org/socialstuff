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

import crypto, {createPublicKey, publicEncrypt} from 'crypto';
import path                                     from 'path';
// @ts-ignore
import customEnv                                             from 'custom-env';
import {v1}                                                  from 'uuid';
import fs                                                    from 'fs';
import {createConnection, rebuildDatabase, sharedConnection} from './mysql';
import {delay}                                               from '@socialstuff/utilities/common';
import {RowDataPacket}                                       from 'mysql2/promise';

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

  const serverPrivateRsaString = fs.readFileSync(keysPath).toString('utf-8');
  const serverRsaPublicKey = createPublicKey(serverPrivateRsaString);
  const serverPublicRsaString = serverRsaPublicKey.export({ type: 'pkcs1', format: 'pem' });

  const db = await createConnection({multipleStatements: true});

  if (ENV === 'dev') {
    console.log('Setting up database...');
    await rebuildDatabase();
    console.log('Database ready for use!');
    const sampleCryptData = 'foobar';
    console.log(`server rsa encrypt: '${sampleCryptData}' => ${publicEncrypt(serverRsaPublicKey, Buffer.from(sampleCryptData)).toString('base64')}`);
  }

  const [[{rootRegistered}]] = await db.query<RowDataPacket[]>('SELECT COUNT(*) rootRegistered FROM users WHERE username = \'root\';');
  if (!rootRegistered) {
    const insertRootUserSql = 'INSERT INTO users (id, username, password, public_key, is_admin, mfa_seed, can_login) VALUES (?, ?, ?, ?, false, ?, false);';
    const idBuffer = Buffer.from(v1().replace(/-/, ''), 'hex');
    await db.query(insertRootUserSql, [idBuffer, 'root', '', serverPublicRsaString, '']);
  }

  // TODO add rsa keys to version control

  if (ENV !== 'dev') {
    await db.end();
    return;
  }

  const ecdh = crypto.createECDH('secp384r1');
  ecdh.generateKeys();
  process.env.ECDH_PRIVATE_KEY = ecdh.getPrivateKey().toString('base64');

  console.log('seeding some data...');

  {
    const id = v1().replace(/-/g, '');
    const token = id;//await hashHmac(id);
    await db.query('INSERT INTO invite_code (code, expiration_date, active, max_usage) VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY), 1, 5);', [token]);
    console.log('sample invite code:      ', id);
  }
  await db.end();
  await sharedConnection();
  console.log('finished db initialization');
})();
