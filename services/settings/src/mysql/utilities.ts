import {NextFunction, Request, Response} from 'express';
import {sharedConnection}                from './client';
import {RequestWithDependencies}         from './request-with-dependencies';

/**
 * injects a database connection into a request
 * @param req request from client
 * @param _ response to client
 * @param next NextFunction
 */
export async function injectDatabaseConnectionIntoRequest(req: Request, _: Response, next: NextFunction) {
  (req as RequestWithDependencies).dbHandle = await sharedConnection();
  next();
}