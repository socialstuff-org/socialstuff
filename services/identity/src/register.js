import express                    from 'express';
import {body}                     from 'express-validator';
import {sharedConnection}         from './db-util';
import {rejectOnValidationError}  from './express-util';
import {generateToken}                                        from './token-helper';
import {hashHmac, hashUnique, passwordIssues, USERNAME_REGEX} from './security-helper';

const middleware = [
  body('username').isString().matches(USERNAME_REGEX).withMessage('Please pick a username containing regular characters (a-zA-Z), numbers, and \'_\' and \'.\', with a length between 5 and 20 characters!'),
  body('username').custom(async username => {
    if (!username) {
      return;
    }
    const db = await sharedConnection();
    const [[{userExists}]] = await db.query('SELECT COUNT(*) as `userExists` FROM users WHERE username LIKE ?;', [username]);
    if (userExists) {
      return Promise.reject('Username is already taken!');
    }
  }),
  body('password').custom(async password => {
    if (!password) {
      return;
    }
    const issues = passwordIssues(password);
    if (issues !== {}) {
      return Promise.reject(issues);
    }
  }),

  body('public_key').isString().isLength({min: 128}), // TODO key verification
  rejectOnValidationError
];


/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function register(req, res) {
  const db = await sharedConnection();
  const passwordHash = await hashUnique(req.body.password);
  const token = await generateToken();
  const tokenHash = await hashHmac(Buffer.from(token, 'base64'));
  await db.beginTransaction();

  const sql = `
    SET @user_id := uuid();
    INSERT INTO users (id, username, password, public_key) VALUES (@user_id, ?, ?, ?);
    INSERT INTO tokens (id_user, token, expires_at) VALUES (@user_id, ?, DATE_ADD(NOW(), INTERVAL 1 DAY));
  `;
  try {
    await db.query(sql, [req.body.username, passwordHash, req.body.public_key, tokenHash]);
    await db.commit();
    res.status(201).json({data: {message: 'Registered successfully!', token}});
  } catch (e) {
    console.error(e);
    await db.rollback();
    res.status(500).end();
  }
}

export default [middleware, register];
