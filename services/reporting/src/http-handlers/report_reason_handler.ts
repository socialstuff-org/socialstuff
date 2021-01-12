import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, header, ValidationChain} from 'express-validator';
import {injectProcessEnvironmentIntoRequest} from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {rejectOnValidationError} from '@socialstuff/utilities/express';

import {RowDataPacket} from 'mysql2/promise';

const reportReasonHandler = Router();
/**
 * Validates the fields body by checking if
 * - max report violations is an Integer
 * - reason is of type String
 * - id is an Integer and optional
 */
export const middleware:ValidationChain[] = [
  body('max_report_violations').isInt(),
  body('reason').isString(),
  body('id').optional().isInt()
];


/**
 * retrieves all report reasons from the database
 * @param req request from the client. Does not require any special arguments
 * @param res response that will be returned to client
 */
async function getAllReportReasons(req: Request, res: Response) {
  const sql = 'SELECT * FROM report_reason;';
  const db = (req as RequestWithDependencies).dbHandle;
  const reports = await db.query(sql);
  console.log(reports[0]);
  return res.status(200).json(reports[0]);
}

/**
 * Method edits a report reason
 * @param req includes a body that contains the new report reason in this format:
 * {
 *   id: '123'
 *   reason: 'some reason'
 *   max_report_violations: 15
 * }
 * @param res is the response that will be returned upon completion of the request. It contains the newly added reason in its body
 */
async function editReportReason(req: Request, res: Response) {
  const maxReportViolations = req.body.max_report_violations;
  const reason = req.body.reason;
  const sql = 'UPDATE report_reason SET reason = ?, max_report_violations = ? WHERE id = ?;';
  const db = (req as RequestWithDependencies).dbHandle;
  console.log('Checking if reason already exists: ');

  try {
    const sqlVerify = 'SELECT count(*) >= 1 AS present, id as id FROM report_reason WHERE reason LIKE UPPER(?);';
    console.log('executing query');
    const [[{present}]] = await db.query<RowDataPacket[]>(sqlVerify, [req.body.reason, req.body.max_report_violations]);
    console.log('reason present? ', present);
    if (present) {
      console.log('ending request');
      res.status(409).json({error: 'The report reason already exists'});
      return;
    }

    console.log('adding reason:     ', req.body.reason);
    console.log('With ID:           ', req.body.id);
    console.log('With max_report_v: ', maxReportViolations);
    await db.query(sql, [reason, maxReportViolations, req.body.id]);
    const retSQL = 'SELECT * FROM report_reason WHERE id = ?;';
    res.status(200).json((await db.query(retSQL, [req.body.id]))[0]);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }


}

/**
 * Deletes a report reason in the database
 * @param req request from client, containing the id of the reason as a header attribute
 * @param res response that will be sent  back to the client,
 */
async function removeReportReason(req: Request, res: Response) {
  try{
    console.log('Removing reason');
    const db = (req as RequestWithDependencies).dbHandle;
    const deleteFromSQL = 'DELETE FROM report_reason WHERE id = ?';
    await db.query(deleteFromSQL, [req.headers.id]);
    res.status(200).json({
      msg: 'Deleted report reason with id ' + req.headers.id,
    });
  } catch (e) {
    res.status(500).json({error: 'Couldn\'t delete entry with ID: ' + req.headers.id});
  }
}

/**
 * adds a report reason tho the database
 * @param req request from the client. Contains the new reason as a JSON in the format:
 * {
 *   "reason": "some new reason",
 *   "max_report_violations": 50,
 * }
 * @param res
 */
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

/**
 * validates if the header ID is an integer for the delete request
 */
export const validateHeader: ValidationChain[] = [header('id').isInt()];

reportReasonHandler.use(injectProcessEnvironmentIntoRequest , injectDatabaseConnectionIntoRequest);
reportReasonHandler.get('/', getAllReportReasons);
reportReasonHandler.put('/', middleware, rejectOnValidationError, editReportReason);
reportReasonHandler.post('/', middleware, rejectOnValidationError, addReportReason);
reportReasonHandler.delete('/', validateHeader, rejectOnValidationError, removeReportReason);

export default reportReasonHandler;
