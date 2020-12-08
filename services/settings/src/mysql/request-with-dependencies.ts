import {Request}    from 'express';
import {Connection} from 'mysql2/promise';

export interface RequestWithDependencies extends Request {
  env: { [key: string]: string };
  dbHandle: Connection;
}
