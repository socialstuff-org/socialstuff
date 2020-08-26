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

import {Request, Response}          from 'express';
import {body}                       from 'express-validator';
import {sharedConnection}           from '../utilities/mysql';
import {rejectOnValidationError}    from '../utilities/express';
import {hashHmac, verifyHashUnique} from '../utilities/security';
import {RowDataPacket}              from 'mysql2/promise';

const middleware = [
  body('username').isString().isLength({min: 5, max: 20}).withMessage('This is not a valid username.'),
  body('password').isString().isLength({min: 10, max: 40}).withMessage('This is not a valid password.'),
  rejectOnValidationError,
];

async function login(req: Request, res: Response) {
  const db = await sharedConnection();

  const sql = 'SELECT id,password as passwordHash FROM users WHERE username LIKE ?;';

  const [userRow] = await db.query(sql, [req.body.username]) as RowDataPacket[][];

  if (!userRow.length) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }
  const [{id, passwordHash}] = userRow;

  const passwordsMatch = await verifyHashUnique(passwordHash, req.body.password);
  if (!passwordsMatch) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }

  const token = '';
  // TODO generate uuid as token
  const addTokenSql = 'INSERT INTO tokens (token, id_user, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 DAY));';
  try {
    await db.query(addTokenSql, [hashHmac(token), id]);
  } catch (e) {
    res.status(500).json({errors: [{message: 'Internal login error!'}]}).end();
    return;
  }

  res.status(200).json({data: {token}});
}


export default [...middleware, login];
