import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, ValidationChain} from 'express-validator';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {RowDataPacket} from 'mysql2/promise';

const reportReasonHandler = Router();

export const middleware:ValidationChain[] = [
  body('max_report_violations').isInt(),
  body('reason').isString()
];

async function getAllReportReasons(req: Request, res: Response) {
  const sql = 'SELECT * FROM report_reason;';
  const db = (req as RequestWithDependencies).dbHandle;
  const reports = await db.query(sql);
  return res.status(200).json(reports[0]);
}

async function editReportReason(req: Request, res: Response) {
  const max_report_violations = req.body.max_report_violations;
  const reason = req.body.reason;
  const sql = 'UPDATE report_reason SET reason = ?, max_report_violations = ? WHERE id = ?;';
  const db = (req as RequestWithDependencies).dbHandle;
  try {
    await db.query(sql, [reason, max_report_violations, req.body.id]);
  } catch (e) {
    console.log(e);
    throw new Error('Something went wrong!');
  }

  const retSQL = 'SELECT * FROM report_reason WHERE id = ?;';
  res.status(200).json((await db.query(retSQL, [req.body.id]))[0]);

}

async function addReportReason(req: Request, res: Response) {
  const db = (req as RequestWithDependencies).dbHandle;
  const insertRR = 'INSERT INTO report_reason (reason, max_report_violations) VALUES (?, ?)';
  const lastID = 'SELECT LAST_INSERT_ID() as id;';
  await db.beginTransaction();
  try {
    await db.query(insertRR, [req.body.reason, req.body.max_report_violations]);
    const [[{id}]] = await db.query<RowDataPacket[]>(lastID);
    await db.commit();
    res.status(200).json({
      id: id,
      reason: req.body.reason,
      max_report_violations: req.body.max_report_violations
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
}

reportReasonHandler.use(injectProcessEnvironmentIntoRequest , injectDatabaseConnectionIntoRequest);
reportReasonHandler.get('/', getAllReportReasons);
reportReasonHandler.post('/', middleware, addReportReason);
reportReasonHandler.put('/', middleware, editReportReason);

export default reportReasonHandler;
