import {USERNAME_REGEX, hashUnique, passwordIssues} from '../utilities/security';
import crypto                                       from 'crypto';
import {body, ValidationChain}                      from 'express-validator';
import {rejectOnValidationError}                    from '../utilities/express';
import {sharedConnection}                           from '../utilities/mysql';
import {v1 as v1uuid}                               from 'uuid';
import {Request, Response}                          from 'express';
import {RowDataPacket}                              from 'mysql2/promise';
import {registrationChallenge}                      from '../utilities/registration-challenge';
import {registrationChallengeMode}                  from '../constants';

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
    .custom(async pk => {
      try {
        crypto.createPublicKey(pk);
        return;
      } catch (e) {
        console.error(e.message);
        throw new Error('Invalid public key!');
      }
    }),
  rejectOnValidationError as any,
];

async function register(req: Request, res: Response) {
  const db = await sharedConnection();
  const passwordHash = await hashUnique(req.body.password);

  const id = v1uuid().replace(/-/g, '');
  const addUserSql = 'INSERT INTO users (id, username, password, public_key) VALUES (unhex(?), ?, ?, ?);';

  await db.beginTransaction();
  try {
    await db.query(addUserSql, [id, req.body.username, passwordHash, req.body.public_key]);
    const token = await registrationChallenge({ userId: id, email: req.body.email });
    await db.commit();
    const response = {data: {message: 'Registered successfully!'}};
    if (token) {
      const key = crypto.createPublicKey(req.body.public_key);
      const encryptedToken = crypto.publicEncrypt(key, Buffer.from(token, 'utf-8')).toString('base64');
      (response.data as any).token = encryptedToken;
    }
    res.status(201).json(response);
  } catch (e) {
    await db.rollback();
    res.status(500).end();
  }
}

const final: ValidationChain[] = [];
if (registrationChallengeMode === 'email') {
  final.push(body('email').isEmail());
}

final.push(...middleware, register);

export default final;
