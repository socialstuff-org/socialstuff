import {Request, Response, Router} from 'express'
import {getReports} from '../mysql/mysql'
const reportCreationInterface = Router();

async function testConnection() {
  console.log("report creation has been called");
  return getReports();
}

function addReportReason() {
  //return connection.query('SELECT * FROM report');

  //return undefined;
}

reportCreationInterface.post("/", addReportReason);
reportCreationInterface.get("/", testConnection);
reportCreationInterface.delete("/");

export default reportCreationInterface