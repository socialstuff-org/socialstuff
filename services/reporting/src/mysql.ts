// This file is part of SocialStuff.
//
// SocialStuff is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with SocialStuff.  If not, see <https://www.gnu.org/licenses/>.

import * as mysql          from 'mysql2/promise';
// @ts-ignore
import migrate             from 'migrate';
import {promisify}         from 'util';
import {ConnectionOptions} from 'mysql2';

/**
 * sets up the db Connection by accessing the .env file and injectiong its attributes
 * @param config
 */
export function createConnection(config: ConnectionOptions = {}) {
  config = {
    ...config,
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  return mysql.createConnection(config);
}

let _sharedConnection: Promise<mysql.Connection> | undefined;

/**
 * sets up a shared connection that can be used everywhere
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
