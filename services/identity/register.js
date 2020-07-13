const express = require('express');
const { validationResult, body } = require('express-validator');
const { sharedConnection } = require('./db-util');
const { rejectOnValidationError } = require('./express-util');
const argon = require('argon2');

const router = express.Router();

const middleware = [
  body('username').isString().isLength({ min: 2 }).withMessage('The username should be at least 2 characters long!'),
  body('password').isString().matches(/[a-zA-Z0-9]{10,}/).withMessage('Please choose a suitable password!'),
  rejectOnValidationError,
];

/**
 * 
 * @param {import('express').Request} req 
 * @param {Express.Response} res 
 */
async function register(req, res) {
  const db = await sharedConnection();
  const userExists = await db.query('SELECT COUNT(*) FROM users WHERE username LIKE ?;', [username]);
  console.dir(userExists);

  const hash = await argon.hash(req.body.password);
  res.send('foobar');
}

module.exports = [middleware, register];
