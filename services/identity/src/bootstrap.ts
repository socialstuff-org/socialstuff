// @ts-ignore
import customEnv                                             from 'custom-env';
import {createConnection, rebuildDatabase, sharedConnection} from './utilities/mysql';
import {v1}                                                  from 'uuid';

const ENV = process.env.NODE_ENV || 'dev';
customEnv.env(ENV);

export default (async () => {
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
