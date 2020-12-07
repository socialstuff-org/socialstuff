import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, ValidationChain} from 'express-validator';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';

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
  const sql = 'UPDATE report_reaon SET reason = ?, max_report_violations = ?;';
  const db = (req as RequestWithDependencies).dbHandle;
  db.query(sql, [reason, max_report_violations]);

  const retSQL = 'SELECT * FROM report_reason;';
  res.status(200).json(await db.query(retSQL));

}

reportReasonHandler.use(injectProcessEnvironmentIntoRequest);
reportReasonHandler.get('/', getAllReportReasons);
reportReasonHandler.put('/', middleware, editReportReason);

export default reportReasonHandler;
