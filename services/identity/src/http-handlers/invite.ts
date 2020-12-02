import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, header, ValidationChain} from 'express-validator';
import {rejectOnValidationError} from '@socialstuff/utilities/express';
import {sharedConnection} from '../mysql';
import {RowDataPacket} from 'mysql2/promise';
import {injectDatabaseConnectionIntoRequest} from '../utilities';

export const middleware: ValidationChain[] = [
/*  header("user_token")
    .isString()
    .custom(async token => {
      const request = require('request');
const options = {
  method: 'GET',
  url: 'http://127.0.0.1:3002/settings/security',
  headers: {
  }
};
let result:boolean = true;
await request(options, function (error:any, response:Response) {
  if (error) throw new Error(error);
  result = ('true' === response.get('inv_only.inv_only_by_admin') || ('1' === response.get('inv_only.inv_only_by_admin')));
});

if (result) {
  //TODO check if user is admin
}


    }),*/
  body('max_usage')
    .isInt()
    .withMessage('Pick an Integer as max_usage!'),
  body('times_used')
    .isInt()
    .withMessage('pick an Integer as times_used!'),
  //body('expiration_date')
  //  .isDate(),
  body('active')
    .isBoolean(),
  body('code')
    .isString().custom(async code => {
      if (code === '') {
        throw new Error('Code was empty');
      }
      console.log('checking code: ' + code);
      const db = await sharedConnection();
      const sql = 'SELECT COUNT(*) AS numcodes FROM invite_code WHERE code = ?;';
      const [[{numcodes}]] = await db.query<RowDataPacket[]>(sql, [code]);
      console.log('Number of codes already in db with inv_code: ' + numcodes);
      if (numcodes === 0) {
        console.log('Returning true');
        return;
      } else {
        console.log('Rejecting promise');
        throw new Error('Already exists');
        //return Promise.reject('Username is already taken!');
      }

    })
];

export const headerMiddleware: ValidationChain[] = [
  header('rows_per_page').notEmpty().isInt(),
  header('current_page').notEmpty().isInt(),
  header('sort_param').isString()
];


async function getAllInvitations(req: Request, res: Response) {
  const db = (req as RequestWithDependencies).dbHandle; //await sharedConnection();
  const headers = req.headers;

  console.log('getting all invitations');
  const rpp = Number(headers.rows_per_page);
  console.log('rows per page: ', rpp);
  const currentPage = Number(headers.current_page);

  const startIndex = (rpp * (currentPage)) - rpp;
  const endIndex = startIndex + rpp;
  let response ;
  if (headers.sortparam !== null) {
    const sql = 'SELECT * FROM invite_code ORDER BY ?, id LIMIT ?,?';
    response = await db.query(sql, [headers.sort_param, startIndex, endIndex]);
  } else {
    const sql = 'SELECT * FROM invite_code ORDER BY id LIMIT ?,?';
    response = await db.query(sql, [startIndex, endIndex]);
  }

  return res.status(200).json({ret: response[0]});
}

async function addInviteCode(req: Request, res: Response){

  const invCodeToAdd = req.body;
  console.log('Adding inv_code: ' + invCodeToAdd.code);
  try {
    const db = (req as RequestWithDependencies).dbHandle;
    const sql = 'INSERT INTO invite_code (max_usage,  times_used, expiration_date, active, code) VALUES (?, ?, ?, ?, ?);';
    const sqlLastId =  'SELECT LAST_INSERT_ID() as id;';
    console.log('About to insert data');
    await db.query(sql, [invCodeToAdd.max_usage, invCodeToAdd.times_used, invCodeToAdd.expiration_date, invCodeToAdd.active, invCodeToAdd.code]);
    console.log('data inserted');
    const [retId] = await db.query(sqlLastId);

    res.status(200).json(retId);
  } catch (e) {
    res.status(500);
  }
}

async function deleteInviteCode(req: Request, res: Response) {
  console.log('delete invite was called');
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
inviteManagementInterface.use(injectDatabaseConnectionIntoRequest);

inviteManagementInterface.get('/', headerMiddleware, rejectOnValidationError, getAllInvitations);
inviteManagementInterface.post('/', middleware, rejectOnValidationError, addInviteCode);
inviteManagementInterface.delete('/', deleteInviteCode);

//const final: any[] = [];
//final.push(middleware, rejectOnValidationError, injectDatabaseConnectionIntoRequest, addInviteCode);

export default inviteManagementInterface;
