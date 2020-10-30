import {Request, Response, Router} from 'express'
import {getReportReasons} from '../mysql/mysql'
import {addReportReason} from '../mysql/mysql'
import secSettings from '../res/security_settings.json';
import {ErrorResponse} from '@socialstuff/utilities/responses';
import {body} from 'express-validator';

const reportCreationInterface = Router();


async function getAllReports(req:Request, res: Response) {
  console.log("report creation has been called");
  const reports = await getReportReasons();
  return res.json(reports).end();
}

//TODO return correct error message
async function addAReportReason(req: Request, res: Response) {
 // let responseBody:ErrorResponse = {errors: {reason: {msg: "Object is already in database"}} }
  //return connection.query('SELECT * FROM report');
  //console.log("Adding reason: ", req.body);
  const responseCode = await addReportReason(req, res);
  //responseBody
  console.log("Status code: ", responseCode);
  res.status(responseCode);
  //res.json(responseBody);
  //return undefined;
}

reportCreationInterface.post("/", addAReportReason);
reportCreationInterface.get("/", getAllReports);
reportCreationInterface.delete("/");

export default reportCreationInterface

