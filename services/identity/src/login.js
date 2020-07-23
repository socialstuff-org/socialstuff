import express                    from 'express';
import {body}                     from 'express-validator';
import {sharedConnection}         from './db-util';
import {rejectOnValidationError}  from './express-util';
import {generateToken}            from './token-helper';
import {hashHmac, hashUnique}     from './security-helper';

const middleware = [
  // Add maximum AND minimum numbers of characters for username and password? Thought about possible sql injections...

  body('username').isString().isLength({min: 2}).withMessage('This is not a valid username.'),
  body('password').isString().isLength({min: 2}).withMessage('This is not a valid password.'),

  // I do not make use of userExists here, because otherwise someone could take notes which usernames are registered and which not.

  rejectOnValidationError
];

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function login(req, res) {
  const db = await sharedConnection();

  const sql = `
    SELECT users.id, users.username, users.password, tokens.token, tokens.expires_at
    FROM users u
    INNER JOIN tokens t ON u.id = t.id_user;
  `;

  // TODO: Now when token is expired create a new one and if not sned it in response?

  // If userExists is checked before, remove "User does not exist..."

  console.log('User does not exist or credentials are wrong.');
}

export default [middleware, login];