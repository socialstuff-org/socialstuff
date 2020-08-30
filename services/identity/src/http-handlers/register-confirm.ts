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

import {Response}                                                     from 'express';
import {body, ValidationChain}                                        from 'express-validator';
import {ComposedHandler}                                              from '../types/composed-handler';
import {RequestWithDependencies}                                      from '../types/request-with-dependencies';
import {DataResponse}                                                 from '../types/responses';
import {injectDatabaseConnectionIntoRequest, rejectOnValidationError} from '../utilities/express';
import {sharedConnection}                                             from '../utilities/mysql';
import {hashHmac}                                                     from '../utilities/security';
import {RowDataPacket}                                                from 'mysql2/promise';

const findTokenSql = 'SELECT id_user as userId FROM registration_confirmations WHERE secret_hash=? AND NOW() < expires_at;';
const deleteRegistrationConfirmationSql = 'DELETE FROM registration_confirmations WHERE secret_hash=?;';
const enableUserLoginSql = 'UPDATE users SET can_login=1 WHERE id=?;';

const middleware: ComposedHandler[] = [
  body('token').isHexadecimal().custom(async token => {
    if (!token) {
      return;
    }
    const db = await sharedConnection();
    const tokenHash = await hashHmac(token);
    const [row] = await db.query<RowDataPacket[]>(findTokenSql, [tokenHash]);
    if (row.length === 0) {
      throw new Error('Please provide a valid confirmation token!');
    }
  }),
  rejectOnValidationError,
  injectDatabaseConnectionIntoRequest,
];

async function registerConfirm(req: RequestWithDependencies, res: Response) {
  const db = req.dbHandle!;
  const tokenHash = await hashHmac(req.body.token);
  const [[{userId}]] = await db.query(findTokenSql, [tokenHash]) as RowDataPacket[][];
  await db.beginTransaction();
  console.log(userId);
  try {
    await db.query(deleteRegistrationConfirmationSql, [tokenHash]);
    await db.query(enableUserLoginSql, [userId]);
    await db.commit();
    const response: DataResponse<{ message: string }> = {data: {message: 'Your registration has been completed!'}};
    res.json(response);
  } catch (e) {
    await db.rollback();
    res.status(500).end();
    console.error(e);
  }
}

export default [...middleware, registerConfirm] as any;
