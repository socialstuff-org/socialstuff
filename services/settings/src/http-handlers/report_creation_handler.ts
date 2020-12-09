import {json, Request, Response, Router} from 'express';
import {getReportReasons, updateReasonRequest} from '../mysql/mysql';
import {insertReportReason} from '../mysql/mysql'
import secSettings from '../res/security_settings.json';
import {ErrorResponse} from '@socialstuff/utilities/responses';
import {body, ValidationChain} from 'express-validator';

const reportCreationInterface = Router();

async function getAllReports(req:Request, res: Response) {
  console.log("report creation has been called");
  const reports = await getReportReasons();
  res.json(reports);
}

//TODO return correct error message
async function addAReportReason(req: Request, res: Response) {
  const responseBody = await insertReportReason(req.body);
  console.log("Status code addAReportReason: ", responseBody);
  res.status(200).json(responseBody);
}

async function updateReportReason(req: Request, res: Response) {
  const responseBody = await updateReasonRequest(req.body);
  res.status(200),json(responseBody);
}

reportCreationInterface.post("/", addAReportReason);
reportCreationInterface.put('/', updateReportReason);
reportCreationInterface.get("/", getAllReports);
reportCreationInterface.delete("/");

export default reportCreationInterface;

