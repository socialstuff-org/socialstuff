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

// @ts-ignore
import customEnv                                             from 'custom-env';
import {createConnection, rebuildDatabase, sharedConnection} from './utilities/mysql';
import {v1}                                                  from 'uuid';

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
        await new Promise(res => {
          setTimeout(res, 1000);
        });
      }
    }
  }

  const db = await sharedConnection();

  if (ENV !== 'dev') {
    return;
  }

  console.log('Setting up database...');
  await rebuildDatabase();
  console.log('Database ready for use!');
  console.log('seeding some data...');
  const id = v1().replace(/-/g, '');
  await db.query('INSERT INTO registration_invites (secret, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY));', [id]);
  console.log('sample invite code:', id);
})();
