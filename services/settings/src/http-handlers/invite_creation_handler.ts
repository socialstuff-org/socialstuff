import {Request, response, Response, Router} from 'express';
import {getAllInviteCodesFromSQL, updateInviteCodeInSQL, addInviteCodeToSQL, deleteInviteCodeFromSQL} from '../mysql/mysql'


async function getAllInvitations(req: Request, res: Response) {
  console.log('getting all invitations')
  return res.json(await getAllInviteCodesFromSQL());
}

async function editInviteCode(req:Request, res: Response) {
  console.log('Put invite code called')
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

const inviteManagementInterface = Router();
inviteManagementInterface.get("/", getAllInvitations);
inviteManagementInterface.put("/", editInviteCode);
inviteManagementInterface.post("/", addInviteCode);
inviteManagementInterface.delete("/", deleteInviteCode);
export default inviteManagementInterface;