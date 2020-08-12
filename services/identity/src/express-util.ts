import {NextFunction, Request, Response} from 'express';

const {validationResult} = require('express-validator');

export function rejectOnValidationError(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({errors: errors.mapped()});
  }
}
