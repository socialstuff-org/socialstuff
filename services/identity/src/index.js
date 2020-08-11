import {rebuildDatabase, sharedConnection} from './db-util';
import bodyParser                          from 'body-parser';
import customEnv                           from 'custom-env';
import express                             from 'express';
import login                               from './login';
import register                            from './register';
import util                                from 'util';

const ENV      = process.env.NODE_ENV || 'dev';
const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

customEnv.env(ENV);

(async () => {
  {
    let retryConnection = true;
    while (retryConnection) {
      try {
        await sharedConnection();
        retryConnection = false;
      } catch (e) {
        console.error(e);
      }
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

  try {
    await util.promisify(app.listen.bind(app))(APP_PORT, APP_HOST);
  } catch (err) {
    console.error(err);
    return;
  }
  console.log(`Social Stuff Identity service running on ${APP_HOST}:${APP_PORT}.`);
})();

