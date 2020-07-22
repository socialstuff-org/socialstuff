import express    from 'express';
import bodyParser from 'body-parser';
import register   from './register';
import customEnv  from 'custom-env';
import util               from 'util';
import {decrypt, encrypt} from './security-helper';

const ENV = process.env.NODE_ENV || 'dev';

customEnv.env(ENV);

(async () => {
  if (ENV === 'dev') {
    const migrate = require('migrate');
    console.log('setting up database...');
    await util.promisify(migrate.load)({stateStore: '.migrate'})
      .then(set => util.promisify(set.down.bind(set))().then(() => set))
      .then(set => util.promisify(set.up.bind(set))());
    console.log('done');
  }

  await encrypt('foobar').then(decrypt).then(console.log);

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.post('/register', register);

  app.listen(3000, '0.0.0.0', err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Social Stuff Identity service running on port 3000.');
  });
})();
