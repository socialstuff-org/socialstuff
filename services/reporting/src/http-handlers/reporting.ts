import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {RowDataPacket} from 'mysql2/promise';

const reportingHandler = Router();

async function reportUser(req: Request, res: Response) {
  const sql = 'SELECT count(*) >= 1 AS alreadyReportedFROM report WHERE reported_by = ? AND timestamp >= NOW() - INTERVAL 15 MINUTE;';
  const db = (req as RequestWithDependencies).dbHandle;
  const [[{alreadyReported}]] = await db.query<RowDataPacket[]>(sql, [req.headers.user_token]);
  if (alreadyReported) {
    res.status(422).json({msg: 'You already reported this user in the last 15 minutes!'}).end();
  } else {
    res.status(200).end();
  }
}

//import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';
//import {body, ValidationChain} from 'express-validator';
reportingHandler.post('/', reportUser);
