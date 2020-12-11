import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, ValidationChain} from 'express-validator';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {rejectOnValidationError} from '@socialstuff/utilities/express';

import {RowDataPacket} from 'mysql2/promise';
import {sharedConnection} from '../mysql';

const reportReasonHandler = Router();

export const middleware:ValidationChain[] = [
  body('max_report_violations').isInt(),
  body('reason').isString().custom(async reason => {
    console.log('Checking if reason already exists: ');
    const db = await sharedConnection();
    const sql = 'SELECT count(*) >= 1 AS present FROM report_reason WHERE reason LIKE UPPER(?);';

    const [[{present}]] = await db.query<RowDataPacket[]>(sql, [reason]);

    console.log('Reason already exists?' , present);
    if (present){
      console.log('reason already exists, throwing error!');
      await Promise.reject('Reason already exists!');
    } else {
      console.log('reason not present yet');
      return;
    }

  })
];

async function getAllReportReasons(req: Request, res: Response) {
  const sql = 'SELECT * FROM report_reason;';
  const db = (req as RequestWithDependencies).dbHandle;
  const reports = await db.query(sql);
  console.log(reports[0]);
  return res.status(200).json(reports[0]);
}

async function editReportReason(req: Request, res: Response) {
  const maxReportViolations = req.body.max_report_violations;
  const reason = req.body.reason;
  const sql = 'UPDATE report_reason SET reason = ?, max_report_violations = ? WHERE id = ?;';
  const db = (req as RequestWithDependencies).dbHandle;
  try {
    console.log('adding reason:     ', req.body.reason);
    console.log('With ID:           ', req.body.id);
    console.log('With max_report_v: ', maxReportViolations);
    await db.query(sql, [reason, maxReportViolations, req.body.id]);
  } catch (e) {
    console.log(e);
    res.status(500).end();
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
reportReasonHandler.put('/', middleware, rejectOnValidationError, editReportReason);
reportReasonHandler.post('/', middleware, rejectOnValidationError, addReportReason);

export default reportReasonHandler;
