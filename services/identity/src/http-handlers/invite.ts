import {Request, Response, Router} from 'express';
import {RequestWithDependencies} from '../request-with-dependencies';
import {body, header, ValidationChain} from 'express-validator';
import {rejectOnValidationError} from '@socialstuff/utilities/express';
import {sharedConnection} from '../mysql';
import {RowDataPacket} from 'mysql2/promise';
import {injectDatabaseConnectionIntoRequest} from '../utilities';
import {} from 'axios';

export const middleware: ValidationChain[] = [
  body('max_usage')
    .isInt()
    .withMessage('Pick an Integer as max_usage!'),
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

    }),
];

export const deleteMiddleware: ValidationChain[] = [
  header('id').notEmpty().isInt()
];

export const headerMiddleware: ValidationChain[] = [
  header('rows_per_page').notEmpty().isInt(),
  header('current_page').notEmpty().isInt(),
  header('sort_param').optional().isString()/*,
  header('user_token')
        //TODO Ask jörn why the validation is not working:
    .isString()
    .custom(async token => {
      const axios = require('axios');
      console.log('validating request');
      const config = {
        method: 'get',
        url: 'http://[::1]:3002/settings/security',
        headers: { }
      };
      let secSettingsInvOnlyByAdmin = null;
      try {
        secSettingsInvOnlyByAdmin = await axios(config);
      } catch (e) {
        throw new Error('Admin settings could not be fetched!');
      }
      console.log('is an admin active: ', secSettingsInvOnlyByAdmin.data);
      if (secSettingsInvOnlyByAdmin.data) {


        const db = await sharedConnection();
        const sql = 'SELECT is_admin AS isAdmin FROM socialstuff_identity.users INNER JOIN tokens t WHERE t.token = ?;';
        const [[{isAdmin}]] = await db.query<RowDataPacket[]>(sql, [token]);
        console.log('User admin: ', isAdmin);
        if (isAdmin) {
          return;
        } else {
          throw new Error('Invite code not validated by admin, please provide a valid invite code!');
        }
      } else{
        console.log('secSettingsInvOnlyByAdmin was false');
        return;
      }
    })*/
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
  let response;
  if (headers.sortparam !== null) {
    const sql = 'SELECT * FROM invite_code ORDER BY ?, id LIMIT ?,?';
    try {
      response = await db.query(sql, [headers.sort_param, startIndex, endIndex]);
    } catch (e) {
      console.log(e);
      throw new Error('Invalid sort parameter!');
    }
  } else {
    const sql = 'SELECT * FROM invite_code ORDER BY id LIMIT ?,?';
    response = await db.query(sql, [startIndex, endIndex]);
  }

  return res.status(200).json({ret: response[0]});
}

async function addInviteCode(req: Request, res: Response) {

  const invCodeToAdd = req.body;
  console.log('Adding inv_code: ' + invCodeToAdd.code);
  try {
    const db = (req as RequestWithDependencies).dbHandle;
    await db.beginTransaction();
    let retId;
    try {

      const sql = 'INSERT INTO invite_code (max_usage,  times_used, expiration_date, active, code) VALUES (?, ?, ?, ?, ?);';
      const sqlLastId = 'SELECT LAST_INSERT_ID() as id;';
      console.log('About to insert data');
      await db.query(sql, [invCodeToAdd.max_usage, 0, invCodeToAdd.expiration_date, invCodeToAdd.active, invCodeToAdd.code]);
      console.log('data inserted');
      [retId] = await db.query(sqlLastId);
      await db.commit();
    } catch (e) {
      console.log(e);
      throw new Error('Transaction failed');
    }
    res.status(200).json(retId);
  } catch (e) {
    res.status(500).end();
  }
}

async function deleteInviteCode(req: Request, res: Response) {
  console.log('delete invite was called');
  const invId = req.headers.id;
  try {
    const sql = 'DELETE FROM invite_code WHERE id = ?';
    const db = (req as RequestWithDependencies).dbHandle;
    console.log('executing query with id: ', invId);
    await db.query(sql, [invId]);
    console.log('query executed');
    res.status(200).json({msg: 'code deleted successfully!'});
  } catch (e) {
    res.status(500).json({error: 'Internal server error has occurred!'});
  }
  //const responseCode = await deleteInviteCodeFromSQL(invId);
}



const inviteManagementInterface = Router();
inviteManagementInterface.use(injectDatabaseConnectionIntoRequest);

inviteManagementInterface.get('/', headerMiddleware, rejectOnValidationError, getAllInvitations);
inviteManagementInterface.post('/', middleware, rejectOnValidationError, addInviteCode);
inviteManagementInterface.delete('/', deleteMiddleware, deleteInviteCode);

//const final: any[] = [];
//final.push(middleware, rejectOnValidationError, injectDatabaseConnectionIntoRequest, addInviteCode);

export default inviteManagementInterface;
