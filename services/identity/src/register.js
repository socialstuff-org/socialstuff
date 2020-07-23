import express                    from 'express';
import {body}                     from 'express-validator';
import {sharedConnection}         from './db-util';
import {rejectOnValidationError}  from './express-util';
import {generateToken}            from './token-helper';
import {hashHmac, hashUnique}     from './security-helper';

const middleware = [

  // Add maximum AND minimum numbers of characters for username and password? Thought about possible sql injections...

  body('username').isString().isLength({min: 2}).withMessage('The username should be at least 2 characters long!'),
  body('username').custom(async username => {

    // Isnt this one unnecessary since we are already checking if it is a string and if not it returns?

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

  // Add a maximum length?

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

  // Added expires_at into token table. 
  // Gives an automatic interval of 1 day which can not be modified by the user. If should be done by user, please add as TODO comment
  // Is based on server time NOT client time (DISCUSSION NEEDED what would be better).
  // IF CORRECTED: delete comments and let us know what was done or add TODO for better solution

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