import * as mysql from 'mysql2/promise';
import {promisify} from "util";
import {createConnection} from './mysql';
// @ts-ignore
import migrate     from 'migrate';


let _sharedConnection: Promise<mysql.Connection> | undefined;

/**
 * provides a shared connection that can be used for database access
 */
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
