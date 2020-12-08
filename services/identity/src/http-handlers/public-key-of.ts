import {Request, Response}                   from 'express';
import {param}                               from 'express-validator';
import {RowDataPacket}                       from 'mysql2/promise';
import {rejectOnValidationError}             from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {RequestWithDependencies}             from '../request-with-dependencies';
import {DataResponse}                        from '@socialstuff/utilities/responses';
import axios                                 from 'axios';

const middleware = [
        param('username').isString(),
        rejectOnValidationError,
        injectDatabaseConnectionIntoRequest,
      ]
;

const selectPublicKeyQuery = 'SELECT public_key FROM users WHERE username LIKE ?;';

export async function publicKeyOf(req: Request, res: Response) {
  const hostName = (req as RequestWithDependencies).env.APP_HOSTNAME || 'localhost';

  const [username, server] = req.params.username.split('@');
  if (server === undefined || server === hostName) {
    const response: DataResponse<{ public_key: string }> = {
      data: {
        public_key: '',
      },
    };
    const db = (req as RequestWithDependencies).dbHandle;
    const [row] = await db.query<RowDataPacket[]>(selectPublicKeyQuery, username);
    if (row.length === 0) {
      res.status(404).end();
      return;
    }
    const [{public_key}] = row;
    response.data.public_key = public_key;
    res.json(response);
  } else {
    const response = await axios.get<DataResponse<{ public_key: string }>>(`//${server}:8086/identity/public-key-of/${username}`);
    res.json(response.data);
  }
}

export default [middleware, publicKeyOf as any];
