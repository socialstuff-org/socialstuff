import {rejectOnValidationError}         from '@socialstuff/utilities/express';
import {NextFunction, Request, Response} from 'express';
import {body}                            from 'express-validator';

export const middleware: any[] = [
  body('envelop').isBase64(),
  body('auth_token').isString(),
  rejectOnValidationError
];

export async function startHandshake(req: Request, res: Response, next: NextFunction){
  const envelop = req.body.envelop;
}

export default [middleware, startHandshake];
