import express                    from 'express';
import {body}                     from 'express-validator';
import {sharedConnection}         from './db-util';
import {rejectOnValidationError}  from './express-util';
import {generateToken}            from './token-helper';
import {hashHmac, hashUnique, verifyHashUnique} from './security-helper';

const middleware = [
  body('username').isString().isLength({min: 2}).withMessage('This is not a valid username.'),
  body('password').isString().isLength({min: 2}).withMessage('This is not a valid password.'),

  rejectOnValidationError
];

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function login(req, res) {
  const db = await sharedConnection();

  const sql = 'SELECT id,password as passwordHash FROM users WHERE username LIKE ?;';

  const [userRow] = await db.query(sql, [req.body.username]);

  if (!userRow.length) {
    // TODO username does not exist
    return;
  }

  const [{id,passwordHash}] = userRow;
  const passwordsMatch = await verifyHashUnique(passwordHash, req.body.password);
  if (!passwordsMatch) {

    return;
  }

  const token = generateToken();
  const addTokenSql = 'INSERT INTO tokens (value, id_user, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 DAY));';
  try {
    await db.query(addTokenSql, [hashHmac(token), id]);
  } catch (e) {
    res.status(500).json({ errors: [{message: 'Internal login error!'}] }).end();
    return;
  }

  res.status(200).json({data:{token}});
}

export default [middleware, login];