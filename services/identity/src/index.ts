import './bootstrap';
import bodyParser from 'body-parser';
import express    from 'express';
import login      from './login';
import register   from './register';
import util       from 'util';

const APP_PORT = parseInt(process.env.APP_PORT || '3000');
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

(async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.post('/register', register);
  app.post('/login', login);

  try {
    const appListen: (port: number, host: string) => Promise<void> = util.promisify(app.listen.bind(app));
    await appListen(APP_PORT, APP_HOST);
  } catch (err) {
    console.error(err);
    return;
  }
  console.log(`Social Stuff Identity service running on ${APP_HOST}:${APP_PORT}.`);
})();

