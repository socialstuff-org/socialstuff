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
import * as mysql  from 'mysql2/promise';
import {Request, response, Response} from 'express';
import {RequestWithDependencies} from './request-with-dependencies';
import {sharedConnection} from './client';
const prisma = new PrismaClient();

/**
 * returns all Report reasons on the server
 */
export async function getReportReasons() {
  const reportReasons = await prisma.report_reason.findMany();
  console.log(reportReasons);
  return reportReasons;
}

/**
 * Adds a report reason to the Database
 * @param reason: The reason in a json format:
 * {
 *   "reason": "some reason",
 *   "max_report_violations": 5
 * }
 * @return 201 if insertion was successfull, 409 if report reason has already been detected in the database
 */
//TODO use different signature
export async function insertReportReason(req: Request, res:Response) {
  const body = req.body;
  console.log(req.body);
  //let existingReasons = [{a: "a"}];
  const existingReasons = await prisma.report_reason.findMany({ where: {reason: body.reason} });
  //existingReasons.forEach()
  for (let i = 0; i < existingReasons.length; i++) {
    return 409;
  }
  await prisma.report_reason.create({
    data: {
      reason: "some",
      max_report_violations: 5,
      report: {create: {}}
    }
  });
  return 201;
}


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
let invite_code = {
  active: true,
  expiration_date: "",
  max_usage: 5,
  times_used: 0,
  code: "abcdef"
};

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
//Todo the request keeps looping here. Cant figure out why. Insertion is successful but nothing is returned
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

export async function deleteInviteCodeFromSQL(invCodeId: number) {
  prisma.invite_code.delete({where: {id: invCodeId}});
  return 200;
}

export async function getSecuritySettings() {
  prisma.security_settings.findFirst()
}

export function createConnection() {
  return mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

export async function setSecuritySettings(settings:any ,req: Request) {
  await sharedConnection();
  const db = (req as RequestWithDependencies).dbHandle;
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