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

import {ValidationChain}                    from 'express-validator';
import {Request, Response}                  from 'express';
import {injectMongodbConnectionIntoRequest} from 'utilities/express';
import {RequestWithDependencies}            from 'types/request-with-dependencies';

export const middleware: ValidationChain[] = [
  injectMongodbConnectionIntoRequest as any as ValidationChain
];

export async function foo(req: RequestWithDependencies, res: Response) {
  const db = req.mongo!;
  res.end('foo');
}

export default [middleware, foo as any];
