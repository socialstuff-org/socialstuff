// This file is part of SocialStuff.
//
// SocialStuff is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with SocialStuff.  If not, see <https://www.gnu.org/licenses/>.
import {PrismaClient} from "@prisma/client"
import * as mysql from 'mysql2/promise';
import {Request, response, Response} from 'express';
import {RequestWithDependencies} from './request-with-dependencies';
import {sharedConnection} from './client';
import {RowDataPacket} from 'mysql2/promise';
const prisma = new PrismaClient();

/**
 * forwards request to reporting service and returns the edited report reason as Json in its body
 * @param newReason is the reason that will be edited following this format:
 * {
 *   'id': 123,
 *   'reason': 'some reason',
 *   'max_report_violations'
 * }
 */
export async function editReasonRequest(newReason:any) {

    const axios = require('axios');
    const config = {
      method : 'put',
      url: 'http://[::]:3003/reporting/report-reasons',
      headers:{
      },
      data: newReason
    }
    console.log('Carrying out request to reporting service')
    const updatedReason = await axios(config);
    console.log(updatedReason.data);
    return updatedReason;

}

/**
 * Forwards request to reporting service and returns all report reasons
 */
export async function getReportReasons() {
  const axios = require('axios');

  const config = {
    method: 'get',
    url: 'http://[::]:3003/reporting/report-reasons',
    headers: {
    }
  };

  const reportReasons = await axios(config);
  console.log(reportReasons.data);
  return reportReasons.data;
}

/**
 * Forwards post request to reporting service
 * Adds a report reason to the Database
 * @param data a new report reason following this format:
 * {
 *   "reason": "some reason",
 *   "max_report_violations": 5
 * }
 * @return the axios result
 */
//TODO use different signature
export async function insertReportReason(data: any) {
  const axios = require('axios');

  const config = {
    method: 'post',
    url: 'http://::1:3003/reporting/report-reasons',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  };
  console.log("carrying out request: ")
  const returnRes = await axios(config);
  console.log(returnRes.status )
  return returnRes;

}

/**
 * Gets all invite codes from SQL by using Prisma framework
 * @param rowsPerPage used for pagination and defines how many rows are returned
 * @param currentPage used for pagination and defines on which page the frontend currently is
 */
export async function getAllInviteCodesFromSQL(rowsPerPage:number, currentPage:number, ) {

  const res:any = prisma.invite_code.findMany();
  if (!isNaN(res.length)) {
    const numPages = res.length / rowsPerPage;
    console.log('num_pages: ', numPages);
    const endIndex = currentPage * numPages;
    const startIndex = endIndex - rowsPerPage;
    const entities = res.slice(startIndex, endIndex);
    const totalPages = Math.ceil(numPages);
    return {
      rows_per_page: rowsPerPage,
      current_page: currentPage,
      total_pages: totalPages,
      rows: entities
    };
  } else {
    return {
      rows_per_page: rowsPerPage,
      current_page: 0,
      total_pages: 0,
      rows: []
    }
  }
}

/**
 * updates the invite codes in sql using the Prisma client
 * @param id identifier of the invite code
 * @param data the new data in json format: {
 *   'active': true,
 *   'expiration_date': '2021-03-31 21:59:59'.
 *   'max_usage': 15,
 *   'code': 'comeInPls'
 * }
 */
export async function updateInviteCodeInSQL(id: number, data: any) {
  await prisma.invite_code.update({where: {
                               id: id
                             },
                             data: {
                               active: data.active,
                               expiration_date: new Date(data.expiration_date),
                               max_usage: data.max_usage,
                               code: data.code
                             }});
  return 201;
}

/**
 * adds a new invite code
 * @param invCodeToAdd the new invite code as a json, following this format:
 * {
 *   'active': true,
 *   'expiration_date': '2021-03-31 21:59:59'.
 *   'max_usage': 15,
 *   'code': 'comeInPls'
 * }
 */
export async function addInviteCodeToSQL(invCodeToAdd: any) {
  console.log("adding inv code to sql");
  await prisma.invite_code.create(
    {
      data: {
        code: invCodeToAdd.code,
        max_usage: invCodeToAdd.max_usage,
        expiration_date: new Date(invCodeToAdd.expiration_date),
        active: invCodeToAdd.active
      }
    });
  return 201;
}

/**
 * deletes the invite code
 * @param invCodeId identifier of the invite code which is to be deleted
 */
export async function deleteInviteCodeFromSQL(invCodeId: number) {
  prisma.invite_code.delete({where: {id: invCodeId}});
  return 200;
}

/**
 * gets the security settings from the database
 * @param db database connection
 * @return security settings in this format:
 * {
  "two_factor_auth": {
    "on" : true,
    "phone": false,
    "email": true
  },
  "confirmed_emails_only": true,
  "individual_pwd_req": {
    "on": true,
    "upper_case": true,
    "number": true,
    "special_char": true,
    "reg_ex": false,
    "reg_ex_string": "[]"
  },
  "inv_only": {
    "on": false,
    "inv_only_by_adm": false
  }
}
 */
export async function findSecuritySettings(db: mysql.Connection) {
  await sharedConnection();
  const sql = 'SELECT * FROM security_settings';
  const [[{
    two_factor_auth_on,
    two_factor_auth_phone,
    two_factor_auth_email,
    confirmed_emails_only,
    individual_pwd_req_upper_case,
    individual_pwd_req_on,
    individual_pwd_req_number,
    individual_pwd_req_special_char,
    individual_pwd_req_reg_ex,
    individual_pwd_req_reg_ex_string,
    inv_only_on, inv_only_inv_only_by_adm
  }]] = (await db.query<RowDataPacket[]>(sql, []));
  const returnJson = {
    two_factor_auth: {
      on: two_factor_auth_on,
      phone: two_factor_auth_phone,
      email: two_factor_auth_email
    },
    confirmed_emails_only: confirmed_emails_only,
    individual_pwd_req: {
      upper_case: individual_pwd_req_upper_case,
      on: individual_pwd_req_on,
      number: individual_pwd_req_number,
      special_char: individual_pwd_req_special_char,
      reg_ex: individual_pwd_req_reg_ex,
      reg_ex_string: individual_pwd_req_reg_ex_string
    },
    inv_only: {
      on: inv_only_on,
      inv_only_by_adm: inv_only_inv_only_by_adm
    }
  }
  return returnJson;
}

/**
 * creates the database connection by accessing the .env file
 */
export function createConnection() {
  return mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

/**
 * Used for modifying the security settings
 * @param settings the new Settings following the following JSON format:
 * {
  "two_factor_auth": {
    "on" : true,
    "phone": false,
    "email": true
  },
  "confirmed_emails_only": true,
  "individual_pwd_req": {
    "on": true,
    "upper_case": true,
    "number": true,
    "special_char": true,
    "reg_ex": false,
    "reg_ex_string": "[]"
  },
  "inv_only": {
    "on": false,
    "inv_only_by_adm": false
  }
}
 * @param db the database connection
 */
export async function setSecuritySettings(settings:any, db: mysql.Connection) {
  await sharedConnection();
  const sql = 'UPDATE security_settings SET two_factor_auth_on = ?, two_factor_auth_email = ?, two_factor_auth_phone = ?, confirmed_emails_only = ?, individual_pwd_req_upper_case = ?, individual_pwd_req_on = ?, individual_pwd_req_number = ?, individual_pwd_req_special_char = ?, individual_pwd_req_reg_ex = ?, individual_pwd_req_reg_ex_string = ?, inv_only_on = ?, inv_only_inv_only_by_adm = ?;';
  console.log(
    "settings.two_factor_auth.email", settings.two_factor_auth.email,
    "settings.two_factor_auth.phone", settings.two_factor_auth.phone,
    "settings.confirmed_emails_only", settings.confirmed_emails_only,
    "settings.individual_pwd_req.upper_case", settings.individual_pwd_req.upper_case,
    "settings.individual_pwd_req.on", settings.individual_pwd_req.on,
    "settings.individual_pwd_req.number", settings.individual_pwd_req.number,
    "settings.individual_pwd_req.special_char", settings.individual_pwd_req.special_char,
    "settings.individual_pwd_req.reg_ex", settings.individual_pwd_req.reg_ex,
    "settings.individual_pwd_req.reg_ex_string", settings.individual_pwd_req.reg_ex_string,
    "settings.inv_only.on", settings.inv_only.on,
    "settings.inv_only.inv_only_by_adm", settings.inv_only.inv_only_by_adm)

  return await db.query(sql, [settings.two_factor_auth.on,
    settings.two_factor_auth.email,
    settings.two_factor_auth.phone,
    settings.confirmed_emails_only,
    settings.individual_pwd_req.upper_case,
    settings.individual_pwd_req.on,
    settings.individual_pwd_req.number,
    settings.individual_pwd_req.special_char,
    settings.individual_pwd_req.reg_ex,
    settings.individual_pwd_req.reg_ex_string,
    settings.inv_only.on,
    settings.inv_only.inv_only_by_adm]);
}
//tReports().catch(e => {
//    throw e
//  }).finally(async () => {
//    await prisma.$disconnect()
//  })