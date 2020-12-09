import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {RowDataPacket} from 'mysql2/promise';
import {injectDatabaseConnectionIntoRequest} from '../utilities';

const reportingHandler = Router();

async function reportUser(req: Request, res: Response) {
  const sql = 'SELECT count(*) >= 1 AS alreadyReportedFROM report WHERE reported_by = ? AND timestamp >= NOW() - INTERVAL 15 MINUTE;';
  try {
    const db = (req as RequestWithDependencies).dbHandle;
    const [[{alreadyReported}]] = await db.query<RowDataPacket[]>(sql, [req.headers.user_token]);
    if (alreadyReported) {
      res.status(422).json({msg: 'You already reported this user in the last 15 minutes!'}).end();
    } else {
      const reportUserSql = 'INSERT INTO report (username, reason_id, reported_by) VALUES (?, ?, ?)';
      await db.query(reportUserSql, [req.body.username, req.body.reason_id, req.headers.user_token]);
      res.status(200).end();
    }
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
}

//import {body, ValidationChain} from 'express-validator';
reportingHandler.post('/', injectDatabaseConnectionIntoRequest, reportUser);
