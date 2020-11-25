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

import crypto                                                 from 'crypto';
import {body, ValidationChain}                                from 'express-validator';
import {v1 as v1uuid}                                         from 'uuid';
import {Request, Response}                                    from 'express';
import {RowDataPacket}                                        from 'mysql2/promise';
import {registrationChallengeMode, registrationChallenges}    from '../constants';
import speakeasy                                                       from 'speakeasy';
import {encrypt, hashHmac, hashUnique, passwordIssues, USERNAME_REGEX} from '@socialstuff/utilities/security';
import {sharedConnection}                                              from '../mysql';
import {RequestWithDependencies}                              from '../request-with-dependencies';
import {DataResponse}                                         from '@socialstuff/utilities/responses';
import {hasChallenge}                                         from '../registration-confirmation-challenge';
import {rejectOnValidationError}                              from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest}                  from '../utilities';

export const middleware: ValidationChain[] = [
  body('username')
    .isString()
    .isLength({ min: 5, max: 20 })
    .matches(USERNAME_REGEX)
    .withMessage('Please pick a username containing regular characters (a-zA-Z), numbers, and \'_\' and \'.\', with a length between 5 and 20 characters!'),
  body('username').custom(async username => {
    if (!username) {
      return;
    }
    const db = await sharedConnection();
    const [[{userExists}]] = await db.query('SELECT COUNT(*) as `userExists` FROM users WHERE username LIKE ?;', [username]) as RowDataPacket[][];
    if (userExists) {
      return Promise.reject('Username is already taken!');
    }
    return;
  }),
  body('password').isString().custom(async password => {
    if (!password) {
      return;
    }
    const issues = passwordIssues(password);
    if (Object.keys(issues).length) {
      throw issues;
    }
  }),
  body('public_key')
    .isString()
    .custom(async (pk: string | undefined) => {
      if (!pk) {
        return;
      }
      try {
        crypto.createPublicKey(pk);
        // if (key.asymmetricKeyType !== 'ec') {
        //   throw new Error('Please provide an ECDH public key!');
        // }
      } catch (e) {
        // console.error(e.message);
        throw new Error('Invalid public key!');
      }
    }),
];

const addUserSql = 'INSERT INTO users (id, username, password, public_key, mfa_seed) VALUES (unhex(?), ?, ?, ?, ?);';
const saveRegistrationConfirmationTokenSql = 'INSERT INTO registration_confirmations (expires_at, secret_hash, id_user) VALUES (DATE_ADD(NOW(), INTERVAL 1 DAY), ?, unhex(?));';
const removeUsedInviteCodeSql = 'DELETE FROM registration_invites WHERE secret = unhex(?);';

export async function register(req: Request, res: Response) {
  const r = req as RequestWithDependencies;
  const db = r.dbHandle;
  const passwordHash = await hashUnique(req.body.password);

  const id = v1uuid().replace(/-/g, '');
  const response: DataResponse<any> = {data: {message: 'Registered successfully!'}};
  const addUserSqlParams = [id, req.body.username, passwordHash, req.body.public_key];
  if (r.env?.MFA === 'TOTP') {
    const mfa = speakeasy.generateSecret({length: 64});
    const encryptedSecret = encrypt(mfa.base32);
    addUserSqlParams.push(encryptedSecret);
    response.data.mfa_seed = mfa.otpauth_url;
  } else {
    addUserSqlParams.push(null);
  }

  await db.beginTransaction();
  try {
    await db.query(addUserSql, addUserSqlParams);
    const challengeToken = v1uuid().replace(/-/g, '');
    const key = crypto.createPublicKey(req.body.public_key);
    const encryptedToken = crypto.publicEncrypt(key, Buffer.from(challengeToken, 'utf-8')).toString('base64');
    if (hasChallenge(registrationChallenges.email)) {
      // TODO send registration email
    } else {
      response.data.token = encryptedToken;
    }
    if (hasChallenge(registrationChallenges.invite)) {
      await db.query(removeUsedInviteCodeSql, [req.body.invite]);
    }
    await db.query(saveRegistrationConfirmationTokenSql, [hashHmac(challengeToken), id]);
    await db.commit();
    res.status(201).json(response);
  } catch (e) {
    await db.rollback();
    res.status(500).end();
  }
}

const final: any[] = [];
if (registrationChallengeMode === 'email') {
  final.push(body('email').isEmail());
}

if (hasChallenge(registrationChallenges.invite)) {
  const checkInviteCode = body('invite')
    .custom(async inviteCode => {
      if (!inviteCode) {
        throw new Error('Registrations are only allowed using invites!');
      }
      const db = await sharedConnection();
      const checkInviteCodeSql = 'SELECT COUNT(*) AS validInvite FROM registration_invites WHERE expires_at > NOW();';
      try {
        const [[{validInvite}]] = await db.query<RowDataPacket[]>(checkInviteCodeSql);
        if (validInvite === 0) {
          throw new Error();
        }
      } catch (e) {
        throw new Error('Please provide a valid invite code!');
      }
    });
  final.push(checkInviteCode);
}

final.push(...middleware, rejectOnValidationError, injectDatabaseConnectionIntoRequest, register);

export default final as any;
