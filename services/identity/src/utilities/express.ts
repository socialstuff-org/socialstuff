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
import {castTo}                          from './types';
import {Dictionary}                      from '../types/common';
import {RequestWithDependencies}         from '../types/request-with-dependencies';
import {sharedConnection}                from './mysql';
import {validationResult}                from 'express-validator';


export function rejectOnValidationError(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({errors: errors.mapped()});
  }
}

export async function injectDatabaseConnectionIntoRequest(req: RequestWithDependencies, _: Response, next: NextFunction) {
  req.dbHandle = await sharedConnection();
  next();
}

export function injectProcessEnvironmentIntoRequest(req: RequestWithDependencies, _: Response, next: NextFunction) {
  req.env = castTo<Dictionary<string>>(process.env);
  next();
}
