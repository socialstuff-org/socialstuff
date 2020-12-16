import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {RowDataPacket} from 'mysql2/promise';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {body, header, ValidationChain} from 'express-validator';

const reportingHandler = Router();

/**
 * used for reporting a user. Verifies if the user sending out the report has already reported the user for the same reason in the past 15 minutes.
 * In that case the report will not pass. Otherwise the report will be registered in the database
 * @param req request from the client. Follow this layout:
 *  Headers:
 *   - user_token
**  Body:
 * {
 *   "username": "userHashOfUserBeingReported",
 *   "reason_id": 123
 * }
 * @param res
 */
async function reportUser(req: Request, res: Response) {
  const sql = 'SELECT count(*) >= 1 AS alreadyReported FROM report WHERE reported_by = ? AND timestamp >= NOW() - INTERVAL 15 MINUTE;';
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
export const validateRequest: ValidationChain[] = [
  header('user_token').isString(),
  body('reason_id').isInt(),
  body('username').isString()
];

//import {body, ValidationChain} from 'express-validator';
reportingHandler.post('/', validateRequest,injectDatabaseConnectionIntoRequest, reportUser);
