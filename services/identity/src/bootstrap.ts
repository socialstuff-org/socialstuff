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

import crypto, {createPublicKey} from 'crypto';
import path                      from 'path';
// @ts-ignore
import customEnv                                             from 'custom-env';
import {v1}                                                  from 'uuid';
import fs                                                    from 'fs';
import {createConnection, rebuildDatabase, sharedConnection} from './mysql';
import {delay}                                               from '@socialstuff/utilities/common';
import {hashHmac, hashUnique}                                from '@socialstuff/utilities/security';

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

  {
    const keysPath = path.join(__dirname, '..', 'priv.pem');
    if (!fs.existsSync(keysPath)) {
      const keys = crypto.generateKeyPairSync('rsa', {modulusLength: 4096});
      fs.writeFileSync(keysPath, keys.privateKey.export({format: 'pem', type: 'pkcs1'}));
      fs.writeFileSync(path.join(__dirname, '..', 'pub.pem'), keys.publicKey.export({format: 'pem', type: 'pkcs1'}));
    }
  }

  const serverPublicRsaString = fs.readFileSync(path.join(__dirname, '..', 'priv.pem')).toString('utf-8');
  const serverRsaPublicKey = createPublicKey(serverPublicRsaString);

  const db = await sharedConnection();

  if (ENV !== 'dev') {
    return;
  }

  const ecdh = crypto.createECDH('secp256k1');
  ecdh.generateKeys();
  process.env.ECDH_PRIVATE_KEY = ecdh.getPrivateKey().toString('base64');
  // const publicKey = ecdh.getPrivateKey().toString('base64');
  const password = crypto.randomBytes(16).toString('hex');
  const username = 'root';

  console.log('Setting up database...');
  await rebuildDatabase();
  console.log('Database ready for use!');
  console.log('seeding some data...');
  const id = v1().replace(/-/g, '');
  const token = await hashHmac(id);
  await db.query('INSERT INTO registration_invites (secret, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY));', [token]);
  console.log('root password:           ', password);
  console.log('sample invite code:      ', id);
  const addUserSql = 'INSERT INTO users (id,username,password,public_key, can_login) VALUES (unhex(?),?,?,?,1);';
  const userID = v1().replace(/-/g, '');
  await db.query(addUserSql, [userID, username, await hashUnique(password), serverRsaPublicKey.export({ type: 'pkcs1', format: 'pem' })]);
  const secret = v1().replace(/-/g, '');
  const secretHash = await hashHmac(secret);
  const addUSerRegistrationConfirmation = 'INSERT INTO registration_confirmations (expires_at, secret_hash, id_user) VALUES (DATE_ADD(NOW(), INTERVAL 1 DAY),?,unhex(?));';
  await db.query(addUSerRegistrationConfirmation, [secretHash, userID]);
  console.log('sample registration code:', secret);
})();
