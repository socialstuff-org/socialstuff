import {Request, Response, Router} from 'express'
import {getReportReasons} from '../mysql/mysql'
import {insertReportReason} from '../mysql/mysql'
import secSettings from '../res/security_settings.json';
import {ErrorResponse} from '@socialstuff/utilities/responses';
import {body} from 'express-validator';

const reportCreationInterface = Router();


async function getAllReports(req:Request, res: Response) {
  console.log("report creation has been called");
  const reports = await getReportReasons();
  res.json(reports).end();

}
//TODO return correct error message
async function addAReportReason(req: Request, res: Response) {
  const responseCode = await insertReportReason(req, res);
  console.log("Status code addAReportReason: ", responseCode);
  res.status(responseCode);
}

reportCreationInterface.post("/", addAReportReason);
reportCreationInterface.get("/", getAllReports);
reportCreationInterface.delete("/");

export default reportCreationInterface;

