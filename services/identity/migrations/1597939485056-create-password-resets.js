// This file is part of SocialStuff Identity.
//
// SocialStuff Identity is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Identity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

const { sharedConnection } = require('../lib/mysql');

module.exports.up = async next => {
  const db = await sharedConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS password_resets(
    expires_at date not null,
    secret binary(16) not null,
    id_user BINARY(16) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await sharedConnection();
  await db.query('DROP TABLE IF EXISTS password_resets CASCADE;');
};
