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

import {rejectOnValidationError} from '.';
import {Response, Request}       from 'express';
import {validationResult}        from 'express-validator';

jest.mock('express-validator');

describe('express', () => {
  describe('rejectOnValidationError', () => {
    test('rejects on errors with status 400', () => {
      const req: Request = {} as any;
      const res: Response = ({
        status: jest.fn(),
        json:   jest.fn(),
      }) as any;
      // @ts-ignore
      res.status.mockReturnValue(res);
      const nextFunction = jest.fn();
      // @ts-ignore
      validationResult.mockReturnValue({
        isEmpty() {
          return false;
        }, mapped() {
          return 42;
        },
      });
      rejectOnValidationError(req, res, nextFunction);
      // @ts-ignore
      validationResult.mockClear();
      expect(nextFunction).not.toBeCalled();
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({errors: 42});
    });

    test('passes the request on, if no error are present', () => {
      const req: Request = {} as any;
      const res: Response = {} as any;
      const nextFunction = jest.fn();
      // @ts-ignore
      validationResult.mockImplementation(() => ({
        isEmpty() {
          return true;
        },
      }));
      rejectOnValidationError(req, res, nextFunction);
      // @ts-ignore
      validationResult.mockClear();
      expect(nextFunction).toBeCalled();
    });
  });
});
