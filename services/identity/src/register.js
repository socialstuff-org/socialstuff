import express                    from 'express';
import {body}                     from 'express-validator';
import {sharedConnection}         from './db-util';
import {rejectOnValidationError}  from './express-util';
import {generateToken}            from './token-helper';
import {hashHmac, hashUnique}     from './security-helper';

const middleware = [
  body('username').isString().isLength({min: 2}).withMessage('The username should be at least 2 characters long!'),
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
  body('password').isString().matches(/[a-zA-Z0-9]{10,}/).withMessage('Please choose a suitable password!'),
  body('public_key').isString().isLength({min: 128}),
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
INSERT INTO tokens (id_user, token) VALUES (@user_id, ?);
`;
  try {
    await db.query(sql, [req.body.username, passwordHash, req.body.public_key, tokenHash]);
    await db.commit();

    // TODO add expires_at with proper time limit

    res.status(201).json({data: {message: 'Registered successfully!', token}});
  } catch (e) {
    console.error(e);
    await db.rollback();
    res.status(500).end();
  }
}

export default [middleware, register];
