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

import {register}                from './register';
import fs                        from 'fs';
import path                      from 'path';
import {FakeMysql}               from 'utilities/test-mocks';
import {RequestWithDependencies} from 'types/request-with-dependencies';
import {Connection}              from 'mysql2/promise';
import {castTo}                  from 'utilities/types';

describe('register', () => {
  const publicKey = fs.readFileSync(path.join(__dirname, '..', '..', 'rsa-example.public')).toString('utf8').replace(/\\n/g, '\n');

  function mockRequest(): any {
    return {
      body: {
        username:   'SomeUsername',
        password:   'StrongPassword123!',
        public_key: publicKey,
      },
    };
  }

  function mockResponse(): any {
    const response = {
      __status: 200,
      __body:   undefined,
      status(code: number) {
        response.__status = code;
        return response;
      },
      json(data: any) {
        response.__body = data;
        return response;
      },
      end() {
        return response;
      },
    };
    return response;
  }

  test('valid registration works', async () => {
    const dbMock = new FakeMysql([0, 0, 0]);
    const req = mockRequest() as RequestWithDependencies;
    const res = mockResponse();
    req.dbHandle = castTo<Connection>(dbMock);
    await register(req, res);
    expect(res.__status).toBe(201);
    const registerResult = res.__body;
    expect(registerResult?.data?.message).not.toBeNull();
    expect(registerResult?.data?.token).not.toBeNull();
    // TODO validate the data, which has been added to the database
  });
});
