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
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

import {Request, Response}          from 'express';
import {body}                       from 'express-validator';
import {sharedConnection}           from 'utilities/mysql';
import {rejectOnValidationError}    from 'utilities/express';
import {hashHmac, verifyHashUnique} from 'utilities/security';
import {RowDataPacket}              from 'mysql2/promise';
import {v1}                         from 'uuid';
import {DataResponse}               from 'types/responses';

const middleware = [
  body('username').isString().isLength({min: 5, max: 20}).withMessage('This is not a valid username.'),
  body('password').isString().isLength({min: 10, max: 40}).withMessage('This is not a valid password.'),
  rejectOnValidationError,
];

async function login(req: Request, res: Response) {
  const db = await sharedConnection();

  const sql = 'SELECT id,password FROM users WHERE username LIKE ? AND can_login=1;';

  const [userRow] = await db.query(sql, [req.body.username]) as RowDataPacket[][];

  if (!userRow.length) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }
  const [{id, password}] = userRow;

  const passwordsMatch = await verifyHashUnique(password, req.body.password);
  if (!passwordsMatch) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }

  const token = v1().replace(/-/g, '');
  const addTokenSql = 'INSERT INTO tokens (token, id_user, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 DAY));';
  try {
    await db.query(addTokenSql, [hashHmac(token), id]);
    const response: DataResponse<{ token: string }> = {data: {token}};
    res.status(201).json(response).end();
  } catch (e) {
    res.status(500).json({errors: [{message: 'Internal login error!'}]}).end();
  }
}


export default [...middleware, login];
