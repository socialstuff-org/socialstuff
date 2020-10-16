//import {secSettings} from '../res/settings_security';
import {Request, Response, Router} from 'express';
import secSettings from '../res/security_settings.json'
import instantiate = WebAssembly.instantiate;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

function getSecSettings(req: Request, res: Response) {
  console.log(secSettings)
  //if (req.get("token") !=="admin") {
  //}//TODO
  //if (!verifyAdmin(req)) {
  //  return;
  //}
  res.json(secSettings).end();
}

function changeSecuritySettings(req: Request, res: Response) {
  const body = req.body;// bodyParser.urlencoded(req.body);// req.body;
  console.log("Body is empty: ", body === null);
  console.log(JSON.stringify(body));
  console.log("Two factor auth on is boolean: ", body.two_factor_auth.on.type)

  if (/*body.two_factor_auth.on instanceof Boolean
    && body.two_factor_auth.phone instanceof Boolean
    && body.two_factor_auth.email instanceof Boolean
    && body.confirmed_emails_only instanceof Boolean
    && body.individual_pwd_req.on instanceof Boolean
    && body.individual_pwd_req.number instanceof Boolean
    && body.individual_pwd_req.special_char instanceof Boolean
    && body.individual_pwd_req.upper_case instanceof Boolean
    && body.individual_pwd_req.reg_ex instanceof Boolean
    && body.individual_pwd_req.reg_ex_string instanceof String
    && body.inv_only instanceof Boolean
    && body.inv_only_by_adm instanceof Boolean*/true) {


    //secSettings.two_factor_auth = body.two_factor_auth;
    secSettings.two_factor_auth.on = body.two_factor_auth.on;
    secSettings.two_factor_auth.phone = body.two_factor_auth.phone;
    secSettings.two_factor_auth.email = body.two_factor_auth.email;
    secSettings.confirmed_emails_only = body.confirmed_emails_only;
    secSettings.individual_pwd_req.on = body.individual_pwd_req.individual_pwd_req;
    secSettings.individual_pwd_req.number = body.individual_pwd_req.number;
    secSettings.individual_pwd_req.special_char = body.individual_pwd_req.special_char;
    secSettings.individual_pwd_req.upper_case = body.individual_pwd_req.upper_case;
    secSettings.individual_pwd_req.reg_ex = body.individual_pwd_req.reg_ex;
    secSettings.individual_pwd_req.reg_ex_string = body.individual_pwd_req.reg_ex_string;
    secSettings.inv_only.on = body.inv_only.on;
    secSettings.inv_only.inv_only_by_adm = body.inv_only_by_adm;

    res.json({data: secSettings});
  } else {
    res.json({error: 500})
  }
}

const settingsInterface = Router();
settingsInterface.get('/', getSecSettings);
settingsInterface.put('/', changeSecuritySettings);

export default settingsInterface;


