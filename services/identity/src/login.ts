import {Request, Response}          from 'express';
import {body}                       from 'express-validator';
import {sharedConnection}           from './db-util';
import {rejectOnValidationError}    from './express-util';
import {hashHmac, verifyHashUnique} from './security-helper';

const middleware = [
  body('username').isString().isLength({min: 5, max: 20}).withMessage('This is not a valid username.'),
  body('password').isString().isLength({min: 10, max: 40}).withMessage('This is not a valid password.'),
  rejectOnValidationError,
];

async function login(req: Request, res: Response) {
  const db = await sharedConnection();

  const sql = 'SELECT id,password as passwordHash FROM users WHERE username LIKE ?;';

  const [userRow] = await db.query(sql, [req.body.username]);

  if (!userRow.length) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }
  const [{id, passwordHash}] = userRow;

  const passwordsMatch = await verifyHashUnique(passwordHash, req.body.password);
  if (!passwordsMatch) {
    res.status(400).json({errors: [{message: 'Invalid credentials!'}]}).end();
    return;
  }

  const token = '';
  // TODO generate uuid as token
  const addTokenSql = 'INSERT INTO tokens (value, id_user, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 DAY));';
  try {
    await db.query(addTokenSql, [hashHmac(token), id]);
  } catch (e) {
    res.status(500).json({errors: [{message: 'Internal login error!'}]}).end();
    return;
  }

  res.status(200).json({data: {token}});
}


export default [...middleware, login];
