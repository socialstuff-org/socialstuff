import customEnv                           from 'custom-env';
import {createConnection, rebuildDatabase} from './db-util';

const ENV = process.env.NODE_ENV || 'dev';
customEnv.env(ENV);

(async () => {
  {
    let retryConnection = true;
    while (retryConnection) {
      try {
        await createConnection();
        retryConnection = false;
      } catch (e) {
        console.error('retrying initial connection...');
        await new Promise(res => {
          setTimeout(res, 1000);
        });
      }
    }
  }

  if (ENV === 'dev') {
    console.log('Setting up database...');
    await rebuildDatabase();
    console.log('Database ready for use!');
  }
})();
