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

import * as mysql  from 'mysql2/promise';
// @ts-ignore
import migrate     from 'migrate';
import {promisify} from 'util';

const host = "localhost"
//const ip = "127.0.0.1";
const port = 5432;
const user = "postgres";
const password = "postgres";
const database = "socialstuff_admin_panel"

export function createConnection() {
  return mysql.createConnection({
    host:     host,
    user:     user,
    password: password,
    database: database,
    port: port
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
