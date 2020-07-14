import express from 'express';
import { body } from 'express-validator';
import { sharedConnection } from './db-util';
import { rejectOnValidationError } from './express-util';
import argon from 'argon2';

const middleware = [
  body('username').isString().isLength({ min: 2 }).withMessage('The username should be at least 2 characters long!'),
  body('password').isString().matches(/[a-zA-Z0-9]{10,}/).withMessage('Please choose a suitable password!'),
  rejectOnValidationError,
];

/**
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function register(req, res) {
  const db = await sharedConnection();
  const userExists = await db.query('SELECT COUNT(*) FROM users WHERE username LIKE ?;', [req.body.username]);
  console.dir(userExists);

  const hash = await argon.hash(req.body.password);
  res.send('foobar');
}

export default [middleware, register];
