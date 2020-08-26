import {NextFunction, Request, Response} from 'express';
import {Connection}                      from 'mysql2/promise';

export interface RequestWithDependencies extends Request {
  dbHandle?: Connection;
}

export type RequestWithDependenciesHandler = (req: RequestWithDependencies, res: Response, next: NextFunction) => any;
