import {Request, Response, Router} from 'express';
import secSettings from '../res/security_settings.json';
//import instantiate = WebAssembly.instantiate;
import {ErrorResponse} from '@socialstuff/utilities/responses';
import {body, check, validationResult} from 'express-validator';
import {findSecuritySettings, setSecuritySettings} from '../mysql/mysql';
import {injectDatabaseConnectionIntoRequest} from '../mysql/utilities';
import {RequestWithDependencies} from '../mysql/request-with-dependencies';

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

async function getSecSettings(req: Request, res: Response) {
  //console.log(secSettings);
  //if (req.get("token") !=="admin") {
  //}//TODO
  //if (!verifyAdmin(req)) {
  //  return;
  //}
  const secSetings = await findSecuritySettings((req as RequestWithDependencies).dbHandle);
  console.log(secSetings);
  res.status(200).json(secSetings).end();
}

async function changeSecuritySettings(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errors in the Json occurred!');
    return res.status(422).json({errors: errors.array()});
  }
  try {
    await setSecuritySettings(req.body, (req as RequestWithDependencies).dbHandle);
    res.status(200).json(await findSecuritySettings((req as RequestWithDependencies).dbHandle));
  } catch (e) {
    res.status(500).json({error: 'An internal error occurred!'})
  }
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
settingsInterface.use(injectDatabaseConnectionIntoRequest);
settingsInterface.get('/', getSecSettings);
settingsInterface.put('/',injectDatabaseConnectionIntoRequest, validationParameters, changeSecuritySettings);

export default settingsInterface;