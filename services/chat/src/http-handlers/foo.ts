// This file is part of SocialStuff Chat.
//
// SocialStuff Chat is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Chat is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Chat.  If not, see <https://www.gnu.org/licenses/>.

import axios                                from 'axios';
import {ValidationChain}                    from 'express-validator';
import {Response}                           from 'express';
import {injectMongodbConnectionIntoRequest} from 'utilities/express';
import {RequestWithDependencies}            from 'types/request-with-dependencies';

export const middleware: ValidationChain[] = [
  injectMongodbConnectionIntoRequest as any
];

const defaultResponse = {
  errors: {
    identity: {
      msg: 'Could not communicate with identity service!'
    }
  }
};

export async function foo(req: RequestWithDependencies, res: Response) {
  const target = req.env!.SOCIALSTUFF_IDENTITY_ENDPOINT + '/register';
  console.log('target:', target);
  try {
    const identityResponse = await axios.post(target);
    res.json(identityResponse.data).end();
  } catch (e) {
    console.error(Object.keys(e));
    res.status(e.response.status || 500).json(e.response.data || defaultResponse).end();
  }
}

export default [middleware, foo as any];
