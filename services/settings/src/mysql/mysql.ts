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
// @ts-ignore
import migrate     from 'migrate';
import {promisify} from 'util';
import {Request, response, Response} from 'express';

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
export async function addReportReason(req: Request, res:Response) {
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
  }).catch(e => {
    throw e
  }).finally(async () => {
      await prisma.$disconnect();
    });
  return 201;
}


export async function getAllInviteCodesFromSQL() {
  prisma.invite_code.findMany();
}
let invite_code = {
  active: true,
  expiration_date: "",
  max_usage: 5,
  times_used: 0,
  code: "abcdef"
};

export async function updateInviteCodeInSQL(id: number, data: Object) {

  await prisma.invite_code.update({where: {
                               id: id
                             },
                             data: {
                               active: data.active,
                               expiration_date: data.expiration_date,
                               max_usage: data.max_usage,
                               code: data.code
                             }})
    .catch(e => {
      throw e
    }).finally(async () => {
      await prisma.$disconnect();
    });
  return 201;
}
//tReports().catch(e => {
//    throw e
//  }).finally(async () => {
//    await prisma.$disconnect()
//  })