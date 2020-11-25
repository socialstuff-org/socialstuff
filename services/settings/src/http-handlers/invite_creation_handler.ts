import {Request, response, Response, Router} from 'express';
import {getAllInviteCodesFromSQL, updateInviteCodeInSQL, addInviteCodeToSQL, deleteInviteCodeFromSQL} from '../mysql/mysql'

const inviteManagementInterface = Router();

async function getAllInvitations(req: Request, res: Response) {
  return res.json(getAllInviteCodesFromSQL()).end();
}

async function editInviteCode(req:Request, res: Response) {
  const newInvCode = req.body;
  const codeId = newInvCode.id;
  const responseCode = await updateInviteCodeInSQL(codeId, newInvCode);
  res.status(responseCode).json(newInvCode);
}

async function addInviteCode(req: Request, res: Response){
  const invCodeToAdd = req.body;

  const responseCode = await addInviteCodeToSQL(invCodeToAdd);
  res.status(responseCode);
}

async function deleteInviteCode(req: Request, res: Response) {
  const inv_id = req.body.id;
  const responseCode = await deleteInviteCodeFromSQL(inv_id);
  res.status(responseCode);
}

inviteManagementInterface.get("/", getAllInvitations);
inviteManagementInterface.put("/", editInviteCode);
inviteManagementInterface.post("/", addInviteCode);
inviteManagementInterface.delete("/", deleteInviteCode);
export default inviteManagementInterface