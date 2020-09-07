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

/* istanbul ignore file */

import {createConnection, rebuildDatabase, sharedConnection} from 'utilities/mysql';
import {hashHmac, hashUnique}                                from 'utilities/security';
import {delay}                                               from 'utilities/common';
import {v1}                                                  from 'uuid';
// @ts-ignore
import customEnv                                             from 'custom-env';
import fs                                                    from 'fs';

const ENV = process.env.NODE_ENV || 'dev';
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

  const db = await sharedConnection();

  if (ENV !== 'dev') {
    return;
  }

  const publicKey = (await fs.promises.readFile(__dirname + '/../rsa-example.public')).toString('utf-8');
  const password = 'foobarfoobar';
  const username = 'johndoe';

  console.log('Setting up database...');
  await rebuildDatabase();
  console.log('Database ready for use!');
  console.log('seeding some data...');
  const id = v1().replace(/-/g, '');
  const token = await hashHmac(id);
  await db.query('INSERT INTO registration_invites (secret, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY));', [token]);
  console.log('sample invite code:      ', id);
  const addUserSql = 'INSERT INTO users (id,username,password,public_key) VALUES (unhex(?),?,?,?);';
  const userID = v1().replace(/-/g, '');
  await db.query<OkPacket>(addUserSql, [userID,username, await hashUnique(password), publicKey]);
  const secret = v1().replace(/-/g, '');
  const secretHash = await hashHmac(secret);
  const addUSerRegistrationConfirmation = 'INSERT INTO registration_confirmations (expires_at, secret_hash, id_user) VALUES (DATE_ADD(NOW(), INTERVAL 1 DAY),?,unhex(?));';
  await db.query(addUSerRegistrationConfirmation, [secretHash, userID]);
  console.log('sample registration code:', secret);
})();
