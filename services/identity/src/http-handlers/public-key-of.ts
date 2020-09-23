import {Response}                from 'express';
import {param}                   from 'express-validator';
import {RowDataPacket}           from 'mysql2/promise';
import {RequestWithDependencies} from 'types/request-with-dependencies';
import {DataResponse}                                                 from 'types/responses';
import {injectDatabaseConnectionIntoRequest, rejectOnValidationError} from 'utilities/express';

const middleware = [
  param('username').isString(),
  rejectOnValidationError,
  injectDatabaseConnectionIntoRequest
]
;

const selectPublicKeyQuery = 'SELECT public_key FROM users WHERE username LIKE ?;';

export async function publicKeyOf(req: RequestWithDependencies, res: Response) {
  const db    = req.dbHandle!;
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
