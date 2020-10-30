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
 */
export async function addReportReason(req: Request, res:Response) {
  const body = req.body;
  console.log(req.body);
  //const existingReasons = prisma.report_reason.findOne({ where: {id = } })


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
  return body;
}
//tReports().catch(e => {
//    throw e
//  }).finally(async () => {
//    await prisma.$disconnect()
//  })