import express from 'express';
import { body } from 'express-validator';
import { sharedConnection } from './db-util';
import { rejectOnValidationError } from './express-util';
import argon from 'argon2';

const middleware = [
  body('username').isString().isLength({ min: 2 }).withMessage('The username should be at least 2 characters long!'),
  body('username').custom(async username => {
    if (!username) return;
    const db = await sharedConnection();
    const [[{userExists}]] = await db.query('SELECT COUNT(*) as `userExists` FROM users WHERE username LIKE ?;', [username]);
    if (userExists) {
      return Promise.reject('Username is already taken!');
    }
  }),
  body('password').isString().matches(/[a-zA-Z0-9]{10,}/).withMessage('Please choose a suitable password!'),
  body('public_key').isString().isLength({ min: 128 }),
  rejectOnValidationError,
];

/**
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function register(req, res) {
  const db = await sharedConnection();
  const hash = await argon.hash(req.body.password);
  const base64hash = Buffer.from(hash, 'utf-8').toString('base64');
  const sql = 'INSERT INTO users (id, username, password, public_key) VALUES (uuid(), ?, ?, ?)';
  try {
    await db.query(sql, [req.body.username, base64hash, req.body.public_key]);
    res.status(201).json({ data: 'Registered successfully!' });
  } catch (e) {
    res.status(500).end();
  }
}

export default [middleware, register];
