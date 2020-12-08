import {NextFunction, Request, Response} from 'express';
import {sharedConnection}                from './client';
import {RequestWithDependencies}         from './request-with-dependencies';

export async function injectDatabaseConnectionIntoRequest(req: Request, _: Response, next: NextFunction) {
  (req as RequestWithDependencies).dbHandle = await sharedConnection();
  next();
}