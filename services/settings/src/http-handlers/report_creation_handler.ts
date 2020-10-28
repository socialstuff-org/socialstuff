import {Request, Response, Router} from 'express';
const reportCreationInterface = Router();

const mysql = require('mysql2');
const connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'socialstuff_admin_panel'
});

async function testConnection() {
  mysql.createConnection()
  const sql = "SELECT * FROM report_reason";
  const [rows] = await connection.promise().query(sql);
  console.log("Received rows: ", rows)
  return rows;
}

function addReportReason() {
  return connection.query('SELECT * FROM report');

  //return undefined;
}

reportCreationInterface.post("/", addReportReason);
reportCreationInterface.get("/", testConnection);
reportCreationInterface.delete("/");

export default reportCreationInterface