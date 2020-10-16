import {Request, Response, Router} from 'express';
import secSettings from '../res/security_settings.json'
import instantiate = WebAssembly.instantiate;
import {ErrorResponse} from '@socialstuff/utilities/responses'

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

const editJsonFile = require("edit-json-file");

//let file = editJsonFile('D:/Documents/fontys/Semester_7/Project/socialstuff/services/settings/src/res/security_settings.json');
let file = editJsonFile(__dirname + '/../res/security_settings.json');

function changeSecuritySettings(req: Request, res: Response) {
  const body = req.body;// bodyParser.urlencoded(req.body);// req.body;
  //console.log("Body is empty: ", body === null);
  //console.log(JSON.stringify(body));
  //console.log("Two factor auth on is boolean: ", body.two_factor_auth.on.type)
  console.log(file)
  console.log(__dirname + '/../res/security_settings.json');
  //console.log("False instance of Boolean: ", false instanceof boolean)
  console.log("Boolean test", typeof body.two_factor_auth.on === "boolean")
  console.log("String test",  typeof body.two_factor_auth.on === "string")

  console.log("tfOn", typeof body.two_factor_auth.on === "boolean");
  console.log("tfPhone", typeof body.two_factor_auth.phone === "boolean");
  console.log("tfEmail", typeof body.two_factor_auth.email === "boolean");
  console.log("tfCEO", typeof body.confirmed_emails_only === "boolean");
  console.log("pwreq_on", typeof body.individual_pwd_req.on === "boolean");
  console.log("pw_req_nb", typeof body.individual_pwd_req.number === "boolean");
  console.log("pw_req_sc", typeof body.individual_pwd_req.special_char === "boolean");
  console.log("pw_req_uc", typeof body.individual_pwd_req.upper_case === "boolean");
  console.log("pw_req_regEx", typeof body.individual_pwd_req.reg_ex === "boolean");
  console.log("pw_req_regExStr", typeof body.individual_pwd_req.reg_ex_string === "string");
  console.log("Inv_only", typeof body.inv_only.on === "boolean");
  console.log("inv_only_admin", typeof body.inv_only.inv_only_by_adm === "boolean");
  //body.individual_pwd_req.reg_ex_string instanceof String
  //TODO express validator
  if (((typeof body.two_factor_auth.on) === "boolean")
    && ((typeof body.two_factor_auth.phone) === "boolean")
    && ((typeof body.two_factor_auth.email) === "boolean")
    && ((typeof body.confirmed_emails_only) === "boolean")
    && ((typeof body.individual_pwd_req.on) === "boolean")
    && ((typeof body.individual_pwd_req.number) === "boolean")
    && ((typeof body.individual_pwd_req.special_char) === "boolean")
    && ((typeof body.individual_pwd_req.upper_case) === "boolean")
    && ((typeof body.individual_pwd_req.reg_ex) === "boolean")
    && ((typeof body.individual_pwd_req.reg_ex_string) === "string")
    && ((typeof body.inv_only.on) === "boolean")
    && ((typeof body.inv_only.inv_only_by_adm) === "boolean")) {


    //secSettings.two_factor_auth = body.two_factor_auth;
    file.set("two_factor_auth.on", body.two_factor_auth.on);
    //secSettings.two_factor_auth.on = body.two_factor_auth.on;
    file.set("two_factor_auth.phone", body.two_factor_auth.phone);
    file.set("two_factor_auth.email", body.two_factor_auth.email);
    file.set("confirmed_emails_only", body.confirmed_emails_only);
    file.set("individual_pwd_req.on", body.individual_pwd_req.individual_pwd_req);
    file.set("individual_pwd_req.number", body.individual_pwd_req.number);
    file.set("individual_pwd_req.special_char", body.individual_pwd_req.special_char);
    file.set("individual_pwd_req.upper_case", body.individual_pwd_req.upper_case);
    file.set("individual_pwd_req.reg_ex", body.individual_pwd_req.reg_ex);
    file.set("individual_pwd_req.reg_ex_string", body.individual_pwd_req.reg_ex_string);
    file.set("inv_only.on", body.inv_only.on);
    file.set("inv_only.inv_only_by_adm", body.inv_only.inv_only_by_adm);
    file.save();

    res.json({data: secSettings});
  } else {
    //const error:ErrorResponse = {};
    //res.status(500).json(error);
    //res.status(500)

  res.json({error: 500})
  }
}

const settingsInterface = Router();
settingsInterface.get('/', getSecSettings);
settingsInterface.put('/', changeSecuritySettings);

export default settingsInterface;


