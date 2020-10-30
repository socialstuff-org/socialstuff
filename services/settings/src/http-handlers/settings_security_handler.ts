import {Request, Response, Router} from 'express';
import secSettings from '../res/security_settings.json';
//import instantiate = WebAssembly.instantiate;
import {ErrorResponse} from '@socialstuff/utilities/responses';
import {body, check, validationResult} from 'express-validator';

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

function getSecSettings(req: Request, res: Response) {
  console.log(secSettings);
  //if (req.get("token") !=="admin") {
  //}//TODO
  //if (!verifyAdmin(req)) {
  //  return;
  //}
  res.json(secSettings).end();
}

const editJsonFile = require('edit-json-file');

//let file = editJsonFile('D:/Documents/fontys/Semester_7/Project/socialstuff/services/settings/src/res/security_settings.json');
let file = editJsonFile(__dirname + '/../res/security_settings.json');

function changeSecuritySettings(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errors in the Json occurred!');
    return res.status(422).json({errors: errors.array()});
  }


  const body = req.body;// bodyParser.urlencoded(req.body);// req.body;

  //body.individual_pwd_req.reg_ex_string instanceof String
  //TODO express validator


  //secSettings.two_factor_auth = body.two_factor_auth;
  file.set('two_factor_auth.on', body.two_factor_auth.on);
  //secSettings.two_factor_auth.on = body.two_factor_auth.on;
  file.set('two_factor_auth.phone', body.two_factor_auth.phone);
  file.set('two_factor_auth.email', body.two_factor_auth.email);
  file.set('confirmed_emails_only', body.confirmed_emails_only);
  file.set('individual_pwd_req.on', body.individual_pwd_req.on);
  file.set('individual_pwd_req.number', body.individual_pwd_req.number);
  file.set('individual_pwd_req.special_char', body.individual_pwd_req.special_char);
  file.set('individual_pwd_req.upper_case', body.individual_pwd_req.upper_case);
  file.set('individual_pwd_req.reg_ex', body.individual_pwd_req.reg_ex);
  file.set('individual_pwd_req.reg_ex_string', body.individual_pwd_req.reg_ex_string);
  file.set('inv_only.on', body.inv_only.on);
  file.set('inv_only.inv_only_by_adm', body.inv_only.inv_only_by_adm);
  file.save();

  res.json({data: secSettings});
}

let validationParameters = [
  check('two_factor_auth.on').isBoolean(),
  check('two_factor_auth.phone').isBoolean(),
  check('two_factor_auth.email').isBoolean(),
  check('confirmed_emails_only').isBoolean(),
  check('individual_pwd_req.on').isBoolean(),
  check('individual_pwd_req.number').isBoolean(),
  check('individual_pwd_req.special_char').isBoolean(),
  check('individual_pwd_req.upper_case').isBoolean(),
  check('individual_pwd_req.reg_ex').isBoolean(),
  check('individual_pwd_req.reg_ex_string').isString(), //TODO find regExMatcher
  check('inv_only.on').isBoolean(),
  check('inv_only.inv_only_by_adm').isBoolean()];


const settingsInterface = Router();
settingsInterface.get('/', getSecSettings);
settingsInterface.put('/', validationParameters, changeSecuritySettings);

export default settingsInterface;


