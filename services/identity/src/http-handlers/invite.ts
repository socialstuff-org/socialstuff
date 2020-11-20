import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, ValidationChain} from 'express-validator';
import {rejectOnValidationError} from '@socialstuff/utilities/express';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {register} from './register';

export const middleware: ValidationChain[] = [
  body('max_usage')
    .isInt()
    .withMessage('Pick an Integer as max_usage!'),
  body('times_used')
    .isInt()
    .withMessage('pick an Integer as times_used!'),
  body('expiration_date')
    .isDate(),
  body('active')
    .isBoolean(),
  body('vode')
    .isString()
];

const final: any[] = [];
final.push(...middleware, rejectOnValidationError, injectDatabaseConnectionIntoRequest, register);



async function getAllInvitations(req: Request, res: Response) {
  const headers = req.headers;
  const db = (req as RequestWithDependencies).dbHandle;

  console.log('getting all invitations');
  //console.log(headers);
  const rpp = Number(headers.rows_per_page);
  console.log('rows per page: ', rpp);
  const currentPage = Number(headers.current_page);

  const startIndex = (rpp * (currentPage)) - rpp;
  const endIndex = startIndex + rpp;
  console.log('current page:  ', currentPage);
  const sql = 'SELECT * FROM invite_code LIMIT ?,?';
  const response1 = await db.query(sql, [startIndex, endIndex]);

  return res.status(200).json({ret: response1});
}

async function editInviteCode(req:Request, res: Response) {
  const newInvCode = req.body;
  const codeId = newInvCode.id;
  console.log('test');
  try {
    const db = (req as RequestWithDependencies).dbHandle;

    const sql = 'UPDATE invite_code SET max_usage = ?, times_used = ?, expiration_date = ?, active = ?, code = ? WHERE id = ?;';

    await db.query(sql, [newInvCode.max_usage, newInvCode.times_used, newInvCode.expiration_date, newInvCode.active, newInvCode.code, codeId]);
    console.log('Put invite code called');
    res.status(200);
  } catch (e) {
    console.log(e);
    res.status(500);

  }
}

async function addInviteCode(req: Request, res: Response){
  const invCodeToAdd = req.body;
  try {
    const db = (req as RequestWithDependencies).dbHandle;
    const sql = 'INSERT INTO invite_code (max_usage,  times_used, expiration_date, active, code) VALUES (?, ?, ?, ?, ?); SELECT LAST_INSERT_ID();';
    const [retId] = await db.query(sql, [invCodeToAdd.max_usage, invCodeToAdd.times_used, invCodeToAdd.expiration_date, invCodeToAdd.active, invCodeToAdd.code]);
    res.status(200).json({id: retId});
  } catch (e) {
    res.status(500);
  }
}

async function deleteInviteCode(req: Request, res: Response) {
  const invId = req.body.id;
  try {
    const sql = 'DELETE FROM invite_code WHERE id = ?';
    const db = (req as RequestWithDependencies).dbHandle;
    await db.query(sql, [invId]);
    res.status(200);
  } catch (e) {
    res.status(500);
  }
  //const responseCode = await deleteInviteCodeFromSQL(invId);
}

const inviteManagementInterface = Router();
inviteManagementInterface.get('/', getAllInvitations);
inviteManagementInterface.put('/', editInviteCode);
inviteManagementInterface.post('/', addInviteCode);
inviteManagementInterface.delete('/', deleteInviteCode);

export default inviteManagementInterface;
