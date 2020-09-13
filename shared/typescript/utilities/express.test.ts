// This file is part of SocialStuff.
//
// SocialStuff is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with SocialStuff.  If not, see <https://www.gnu.org/licenses/>.

import {
  injectDatabaseConnectionIntoRequest,
  injectProcessEnvironmentIntoRequest,
  rejectOnValidationError,
}                                from './express';
import {castTo}                  from './types';
import {RequestWithDependencies} from '../types/request-with-dependencies';
import {Response}                from 'express';
import {sharedConnection}        from './mysql';
import {validationResult}        from 'express-validator';

jest.mock('./mysql');
jest.mock('express-validator');

describe('express', () => {
  describe('injectProcessEnvironmentIntoRequest', () => {
    test('environment injection works', () => {
      const req: RequestWithDependencies = castTo({});
      const res: Response = castTo<Response>({});
      const nextFunction = jest.fn();
      injectProcessEnvironmentIntoRequest(req, res, nextFunction);
      expect(Object.keys(req).length).toBeTruthy();
      expect(nextFunction).toBeCalled();
    });
  });

  describe('injectDatabaseConnectionIntoRequest', () => {
    test('database injection works with stub', next => {
      expect.assertions(1);
      const req: RequestWithDependencies = castTo({});
      const res: Response = castTo<Response>({});
      // @ts-ignore
      sharedConnection.mockResolvedValue(3);
      injectDatabaseConnectionIntoRequest(req, res, () => {
        // @ts-ignore
        sharedConnection.mockClear();
        expect(req.dbHandle).toBe(3);
        next();
      });
    });
  });

  describe('rejectOnValidationError', () => {
    test('rejects on errors with status 400', () => {
      const req: RequestWithDependencies = castTo({});
      const res: Response = castTo<Response>({
        status: jest.fn(),
        json: jest.fn(),
      });
      // @ts-ignore
      res.status.mockReturnValue(res);
      const nextFunction = jest.fn();
      // @ts-ignore
      validationResult.mockReturnValue({ isEmpty() { return false; }, mapped() { return 42; } });
      rejectOnValidationError(req, res, nextFunction);
      // @ts-ignore
      validationResult.mockClear();
      expect(nextFunction).not.toBeCalled();
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({errors: 42});
    });

    test('passes the request on, if no error are present', () => {
      const req: RequestWithDependencies = castTo({});
      const res: Response = castTo<Response>({});
      const nextFunction = jest.fn();
      // @ts-ignore
      validationResult.mockImplementation(() => ({ isEmpty() { return true; } }));
      rejectOnValidationError(req, res, nextFunction);
      // @ts-ignore
      validationResult.mockClear();
      expect(nextFunction).toBeCalled();
    });
  });
});
