import {Request, Response} from 'express';
import { ValidationChain } from 'express-validator';

const middleware: ValidationChain[] = [];

async function logout(_req: Request, _res: Response) {

}

export default [middleware, logout];
