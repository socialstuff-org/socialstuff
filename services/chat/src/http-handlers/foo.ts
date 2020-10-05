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
import {ValidationChain}               from 'express-validator';
import {Request, Response}             from 'express';
import { injectConnectionIntoRequest } from '../mongodb';

export const middleware: ValidationChain[] = [
  injectConnectionIntoRequest as any
];

const defaultResponse = {
  errors: {
    identity: {
      msg: 'Could not communicate with identity service!'
    }
  }
};

export async function foo(req: Request, res: Response) {
  const target = (req as any).env!.SOCIALSTUFF_IDENTITY_ENDPOINT + '/register';
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
