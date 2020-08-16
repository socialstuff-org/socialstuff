import * as util  from 'util';
import * as mysql from 'mysql2/promise';
// @ts-ignore
import migrate    from 'migrate';

export function createConnection() {
  return mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

let _sharedConnection: Promise<mysql.Connection>|undefined;

export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}

export async function rebuildDatabase() {
  await util
    .promisify(migrate.load.bind(migrate))({stateStore: '.migrate'})
    // @ts-ignore
    .then(set => util.promisify(set.down.bind(set))().then(() => set))
    // @ts-ignore
    .then(set => util.promisify(set.up.bind(set))());
}
