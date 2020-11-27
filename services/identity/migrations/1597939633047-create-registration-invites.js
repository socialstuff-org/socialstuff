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
  await db.query(`create table socialstuff_identity.invite_code
(
    id              int auto_increment
        primary key,
    max_usage       int                  null,
    times_used      int        default 0 not null,
    expiration_date datetime             null,
    active          tinyint(1) default 1 not null,
    code            varchar(100)         not null,
    constraint invite_code_code_uindex
        unique (code)
);`);
};

module.exports.down = async next => {
  const db = await sharedConnection();
  await db.query('DROP TABLE IF EXISTS invite_code CASCADE;');
};
