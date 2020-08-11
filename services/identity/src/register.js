import {USERNAME_REGEX, hashHmac, hashUnique, passwordIssues} from './security-helper';
import {body}                                                 from 'express-validator';
import {generateToken}                                        from './token-helper';
import {rejectOnValidationError}                              from './express-util';
import {sharedConnection}                                     from './db-util';
import { v1 as v1uuid } from 'uuid';

const middleware = [
  body('username').isString().matches(USERNAME_REGEX).withMessage('Please pick a username containing regular characters (a-zA-Z), numbers, and \'_\' and \'.\', with a length between 5 and 20 characters!'),
  body('username').custom(async username => {
    if (!username) {
      return;
    }
    const db               = await sharedConnection();
    const [[{userExists}]] = await db.query('SELECT COUNT(*) as `userExists` FROM users WHERE username LIKE ?;', [username]);
    if (userExists) {
      return Promise.reject('Username is already taken!');
    }
  }),
  body('password').isString().custom(async password => {
    if (!password) {
      return;
    }
    const issues = passwordIssues(password);
    if (Object.keys(issues).length) {
      return Promise.reject(issues);
    }
    return Promise.resolve();
  }),

  body('public_key').isString().isLength({min: 128}), // TODO key verification
  rejectOnValidationError,
];


/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function register(req, res) {
  const db           = await sharedConnection();
  const passwordHash = await hashUnique(req.body.password);
  const token        = await generateToken();
  const tokenHash    = await hashHmac(Buffer.from(token, 'base64'));
  await db.beginTransaction();

  const id = v1uuid().replace(/-/g, '');
  const addUserSql = 'INSERT INTO users (id, username, password, public_key) VALUES (unhex(?), ?, ?, ?);';
  const addLoginTokenSql = 'INSERT INTO tokens (id_user, token, expires_at) VALUES (unhex(?), ?, DATE_ADD(NOW(), INTERVAL 1 DAY));';
  try {
    await db.query(addUserSql, [id, req.body.username, passwordHash, req.body.public_key]);
    await db.query(addLoginTokenSql, [id, tokenHash]);
    await db.commit();
    res.status(201).json({data: {message: 'Registered successfully!', token}});
  } catch (e) {
    console.error(e);
    await db.rollback();
    res.status(500).end();
  }
}

export default [middleware, register];
