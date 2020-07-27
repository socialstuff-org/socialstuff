import express            from 'express';
import bodyParser         from 'body-parser';
import register           from './register';
import login              from './login';
import customEnv          from 'custom-env';
import util                                from 'util';
import {rebuildDatabase, sharedConnection} from './db-util';

const ENV = process.env.NODE_ENV || 'dev';
const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

customEnv.env(ENV);

(async () => {
  while (true) {
    try {
      await sharedConnection();
      break;
    } catch (e) {
      console.error(e);
    }
  }

  if (ENV === 'dev') {
    console.log('Setting up database...');
    await rebuildDatabase();
    console.log('Database ready for use!');
  }

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.post('/register', register);
  app.post('/login', login);

  app.listen(APP_PORT, APP_HOST, err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Social Stuff Identity service running on ${APP_HOST}:${APP_PORT}.`);
  });
})();
