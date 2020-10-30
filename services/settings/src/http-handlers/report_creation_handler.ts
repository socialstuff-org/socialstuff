import {Request, Response, Router} from 'express'
import {getReportReasons} from '../mysql/mysql'
import {addReportReason} from '../mysql/mysql'
import secSettings from '../res/security_settings.json';
const reportCreationInterface = Router();

async function getAllReports(req:Request, res: Response) {
  console.log("report creation has been called");
  const reports = await getReportReasons();
  return res.json(reports).end();
}

async function addAReportReason(req: Request, res: Response) {
  //return connection.query('SELECT * FROM report');
  //console.log("Adding reason: ", req.body);
  await addReportReason(req, res);
  console.log("reason should be added");
  res.status(200);
  //return undefined;
}

reportCreationInterface.post("/", addAReportReason);
reportCreationInterface.get("/", getAllReports);
reportCreationInterface.delete("/");

export default reportCreationInterface

