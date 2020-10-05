import {Request, Response}                   from 'express';
import {param}                               from 'express-validator';
import {RowDataPacket}                       from 'mysql2/promise';
import {rejectOnValidationError}             from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {RequestWithDependencies}             from '../request-with-dependencies';
import {DataResponse}                        from '@socialstuff/utilities/responses';

const middleware = [
  param('username').isString(),
  rejectOnValidationError,
  injectDatabaseConnectionIntoRequest
]
;

const selectPublicKeyQuery = 'SELECT public_key FROM users WHERE username LIKE ?;';

export async function publicKeyOf(req: Request, res: Response) {
  const db    = (req as RequestWithDependencies).dbHandle;
  const [row] = await db.query<RowDataPacket[]>(selectPublicKeyQuery, req.params.username);
  if (row.length === 0) {
    res.status(404).end();
    return;
  }
  const [{public_key}] = row;
  const response: DataResponse<{public_key: string}> = {
    data: {
      public_key
    }
  };
  res.json(response);
}

export default [middleware, publicKeyOf as any];
