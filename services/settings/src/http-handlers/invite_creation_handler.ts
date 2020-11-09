import {Request, response, Response, Router} from 'express';
import {getAllInviteCodesFromSQL, updateInviteCodeInSQL} from '../mysql/mysql'
import {prisma} from '../prisma-client';

const inviteManagementInterface = Router();

async function getAllInvitations(req:Request, res: Response) {
  return res.json(getAllInviteCodesFromSQL()).end();
}

async function editInviteCode(req:Request, res: Response) {
  const newInvCode = req.body;
  const codeId = newInvCode.id;
  const responseCode = await updateInviteCodeInSQL(codeId, newInvCode);
  res.status(responseCode);
}

inviteManagementInterface.get("/", getAllInvitations);
inviteManagementInterface.put("/edit", editInviteCode);
export default inviteManagementInterface