import * as mysql  from 'mysql2/promise';
// @ts-ignore
import migrate     from 'migrate';
import {promisify} from 'util';

export function createConnection() {
  return mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

let _sharedConnection: Promise<mysql.Connection> | undefined;

export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}

export async function rebuildDatabase() {
  const set = await promisify(migrate.load.bind(migrate))({stateStore: '.migrate'});
  await promisify(set.down.bind(set))();
  await promisify(set.up.bind(set))();
}
