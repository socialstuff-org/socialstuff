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

import {NextFunction, Request, Response} from 'express';
import {sharedConnection}                from './mysql';
import {RequestWithDependencies}         from './request-with-dependencies';

/**
 * injects database connection into a request
 * @param req the request from the client
 * @param _ the response being returned
 * @param next NextFunction
 */
export async function injectDatabaseConnectionIntoRequest(req: Request, _: Response, next: NextFunction) {
  (req as RequestWithDependencies).dbHandle = await sharedConnection();
  next();
}
