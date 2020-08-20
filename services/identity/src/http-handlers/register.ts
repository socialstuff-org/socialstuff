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
// GNU General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

import {DataResponse}                                        from '../types/data-response';
import {RegisterResponseBody}                                from '../types/register-response-body';
import {USERNAME_REGEX, hashUnique, passwordIssues, encrypt} from '../utilities/security';
import crypto                                                from 'crypto';
import {body, ValidationChain}                               from 'express-validator';
import {rejectOnValidationError}                             from '../utilities/express';
import {sharedConnection}                                    from '../utilities/mysql';
import {v1 as v1uuid}                                        from 'uuid';
import {Request, Response, Handler}                          from 'express';
import {RowDataPacket}                                       from 'mysql2/promise';
import {registrationConfirmationChallenge}                   from '../utilities/registration-confirmation-challenge';
import {registrationChallengeMode, registrationChallenges}   from '../constants';
// import asn1                                         from 'asn1';
import speakeasy                                             from 'speakeasy';

const middleware: ValidationChain[] = [
  body('username')
    .isString()
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
      } catch (e) {
        console.error(e.message);
        throw new Error('Invalid public key!');
      }
      const base64key = pk.replace(/\n/g, '').replace(/-+[A-Z ]+-+/g, '');
      const keyBuffer = Buffer.from(base64key, 'base64');
      // TODO determine the actual key length via ASN.1
      // https://crypto.stackexchange.com/questions/18031/how-to-find-modulus-from-a-rsa-public-key
      if (keyBuffer.length < 256) {
        throw new Error('Please generate an RSA key pair with a length of at least 2048 bits!');
      }
    }),
  body('invite')
    .custom(async inviteCode => {
      if (!process.env.REGISTRATION_CHALLENGES?.includes(registrationChallenges.invite)) {
        return;
      }
      if (!inviteCode) {
        throw new Error('Registrations are only allowed using invites!');
      }
      const db = await sharedConnection();
      const checkInviteCodeSql = 'SELECT COUNT(*) AS validInvite FROM registration_invites WHERE expires_at < NOW();';
      try {
        const [row] = await db.query(checkInviteCodeSql) as RowDataPacket[][];
        if (row.length === 0) {
          throw new Error();
        }
      } catch (e) {
        throw new Error('Please provide a valid invite code!');
      }
    }),
  rejectOnValidationError as any,
];

async function register(req: Request, res: Response) {
  const db = await sharedConnection();
  const passwordHash = await hashUnique(req.body.password);

  const id = v1uuid().replace(/-/g, '');
  const addUserSql = 'INSERT INTO users (id, username, password, public_key, mfa_seed) VALUES (unhex(?), ?, ?, ?, ?);';
  const response: DataResponse<RegisterResponseBody> = {data: {message: 'Registered successfully!'}};
  const addUserSqlParams = [id, req.body.username, passwordHash, req.body.public_key];
  if (process.env.MFA === 'TOTP') {
    const mfa = speakeasy.generateSecret({length: 64});
    const encryptedSecret = await encrypt(mfa.base32);
    addUserSqlParams.push(encryptedSecret);
    response.data.mfa_seed = mfa.otpauth_url;
  } else {
    addUserSqlParams.push(null);
  }

  await db.beginTransaction();
  try {
    await db.query(addUserSql, addUserSqlParams);
    const token = await registrationConfirmationChallenge({userId: id, email: req.body.email});
    await db.commit();
    if (token) {
      const key = crypto.createPublicKey(req.body.public_key);
      const encryptedToken = crypto.publicEncrypt(key, Buffer.from(token, 'utf-8')).toString('base64');
      response.data.token = encryptedToken;
      // TODO! save confirmation token in database!
    }
    res.status(201).json(response);
  } catch (e) {
    await db.rollback();
    res.status(500).end();
  }
}

const final: (ValidationChain | Handler)[] = [];
if (registrationChallengeMode === 'email') {
  final.push(body('email').isEmail());
}

final.push(...middleware, register);

export default final;
