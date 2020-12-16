// @ts-ignore
import customEnv          from 'custom-env';
import {delay}            from '@socialstuff/utilities/common';
import {createConnection} from '../../identity/src/mysql';
// import fs        from 'fs';

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
        retryConnection = false;
      } catch (e) {
        console.error('retrying initial connection...', e);
        await delay(1000);
      }
    }
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

  if (ENV !== 'dev') {
    return;
  }

  // const publicKey = (await fs.promises.readFile(__dirname + '/../rsa-example.public')).toString('utf-8');
})();
