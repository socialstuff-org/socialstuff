import {Request, Response} from 'express';
import {ValidationChain}   from 'express-validator';

const middleware: ValidationChain[] = [

];

async function passwordReset(req: Request, res: Response) {

}

export default [middleware, passwordReset];
