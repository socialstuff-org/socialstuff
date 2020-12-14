import {json, Request, response, Response, Router} from 'express';
import {getReportReasons, editReasonRequest} from '../mysql/mysql';
import {insertReportReason} from '../mysql/mysql'
import {body, header, ValidationChain} from 'express-validator';
import {rejectOnValidationError} from '@socialstuff/utilities/express';

const reportCreationInterface = Router();

/**
 * gets all reports
 * @param req request from client
 * @param res response that is sent back to client. contains status code 200 if successful and 500 in case of error
 */
async function getAllReports(req:Request, res: Response) {
  try {

    console.log("report creation has been called");
    const reports = await getReportReasons();
    res.status(200).json(reports);
  } catch (e) {
    console.log(e);
    res.status(500).json({error: 'The report reasons couldn\'t be fetched, pleas notify the administrator'})
  }
}

/**
 * adds a new report reason
 * @param req request from client
 * @param res response that is sent back to client. contains status code 200 if successful and 500 in case of error
 */
async function addAReportReason(req: Request, res: Response) {
  try {
    const response = await insertReportReason(req.body);
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({error: 'Couldn\'t add the reason, have you perhaps already defined it?'});
  }
}

/**
 * adds a new report reason
 * @param req request from client
 * @param res response that is sent back to client. contains status code 200 if successful and 500 in case of error
 */
async function updateReportReason(req: Request, res: Response) {
  let response;
  try {
    response = await editReasonRequest(req.body);
    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json({error: 'Couldn\'t update the reason, is there a already a reason with the same name?'});
  }
}

/**
 * deletes report reason
 * @param req request from client
 * @param res response that is sent back to client. contains status code 200 if successful and 500 in case of error
 */
async function deleteReportReason(req: Request, res: Response) {
  try {

  const axios = require('axios');

  const config = {
    method: 'delete',
    url: 'http://[::1]:3003/reporting/report-reasons/',
    headers: {
      'id': req.headers.id,
      'Content-Type': 'application/json'
    }
  };
  const response = await axios(config);
  res.status(200).json(response.data);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
}

/**
 * middleware for delete request. validates if:
 * - id is integer
 */
export const deleteMiddleware:ValidationChain[] = [

  header('id').isInt()
]

/**
 * middleware for put request. validates if:
 * - id is integer
 */
export const putMiddleware:ValidationChain[] = [
  header('id').isInt()
]

/**
 * middleware for post and put. Validates if:
 * - max_report_violations is of type int
 * - reason is of type string
 */
export const middleware:ValidationChain[] = [
  body('max_report_violations').isInt(),
  body('reason').isString()
];




reportCreationInterface.post("/", middleware, rejectOnValidationError, addAReportReason);
reportCreationInterface.put('/', middleware, rejectOnValidationError, updateReportReason);
reportCreationInterface.get("/", getAllReports);
reportCreationInterface.delete("/", deleteMiddleware, rejectOnValidationError, deleteReportReason);

export default reportCreationInterface;

