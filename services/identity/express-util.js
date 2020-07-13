const { validationResult } = require('express-validator');

/**
 * 
 * @param {Express.Request} req 
 * @param {import('express').Response} res 
 * @param {Function} next 
 */
function rejectOnValidationError(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({ errors: errors.mapped() });
  }
}

module.exports.rejectOnValidationError = rejectOnValidationError;
