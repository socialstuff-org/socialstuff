import {Request, Response, Router} from 'express';
import postgresClient from "../postgres/postgres_client";
const reportCreationInterface = Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'socialstuff_admin_panel'
});

connection.connect();

function addReportReason() {
  return connection.query('SELECT * FROM report')
  //return undefined;
}

reportCreationInterface.post("/", addReportReason);
reportCreationInterface.delete("/");

export default reportCreationInterface