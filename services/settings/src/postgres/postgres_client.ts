import {Client} from 'ts-postgres';

const host = "localhost"
//const ip = "127.0.0.1";
const port = 5432;
const user = "postgres";
const password = "postgres";
const database = "socialstuff_admin_panel"
const client_config =
{
  "host": host,
  "database": database,
  "port": port,
  "password": password,
  "user": user
}
const postgresClient = new Client(client_config);
const queryInsertReport = "INSERT INTO report_reason "


function addReportReason(reason:String, maxReports:Number) {

}
export default postgresClient;