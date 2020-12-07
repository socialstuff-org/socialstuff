import {Request, Response, Router} from 'express';
//import {RequestWithDependencies} from '../request-with-dependencies';
//import {body, ValidationChain} from 'express-validator';
//import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';

const reportingHandler = Router();

async function reportUser(req: Request, res: Response) {
  //const sql = 'SELECT count(*) FROM report WHERE reported_by = ? AND timestamp >= NOW() - INTERVAL 15 MINUTE;';
  //const db = (req as RequestWithDependencies).dbHandle;
  //db.query(sql, [reportedBy]);


}
