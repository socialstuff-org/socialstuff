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

import {Request, Response}                   from 'express';
import {body}                                from 'express-validator';
import {RowDataPacket}                       from 'mysql2/promise';
import {sharedConnection}                    from '../mysql';
import {hashHmac}                            from '@socialstuff/utilities/security';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {rejectOnValidationError}             from '@socialstuff/utilities/express';
import {DataResponse}                        from '@socialstuff/utilities/responses';
import {RequestWithDependencies}             from '../request-with-dependencies';

const findTokenSql = 'SELECT id_user as userId FROM registration_confirmations WHERE secret_hash=? AND NOW() < expires_at;';
const deleteRegistrationConfirmationSql = 'DELETE FROM registration_confirmations WHERE secret_hash=?;';
const enableUserLoginSql = 'UPDATE users SET can_login=1 WHERE id=?;';

const middleware: any[] = [
  body('token').isHexadecimal().custom(async token => {
    if (!token) {
      return;
    }
    const db = await sharedConnection();
    const tokenHash = hashHmac(token);
    const [row] = await db.query<RowDataPacket[]>(findTokenSql, [tokenHash]);
    if (row.length === 0) {
      throw new Error('Please provide a valid confirmation token!');
    }
  }),
  rejectOnValidationError,
  injectDatabaseConnectionIntoRequest,
];

async function registerConfirm(req: Request, res: Response) {
  const db = (req as RequestWithDependencies).dbHandle;
  const tokenHash = hashHmac(req.body.token);
  const [[{userId}]] = await db.query<RowDataPacket[]>(findTokenSql, [tokenHash]);
  await db.beginTransaction();
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
