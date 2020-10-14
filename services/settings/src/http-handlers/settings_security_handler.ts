import {secSettings} from "../../res/settings_security";
import express, {Request, response, Response} from 'express';

import verifyAdmin from "../admin_security/security_config"

function getSecSettings(req: Request, res: Response) {
    //if (req.get("token") !=="admin") {

    //}//TODO
    if (!verifyAdmin(req)) {
        return;
    }
    res = response;
    return res.send(secSettings);
}

function changeSecuritySettings(req: Request, res: Response) {
    res = response;
    var body = req.body;

    secSettings.two_factor_auth = body.two_factor_auth
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

    //TODO check with Jörn if response is correct this way
    return res;
}

var settingsInterface = express();
settingsInterface.get("/security-settings", (req, res) => getSecSettings(req, res));

settingsInterface.post("/security-settings", ((req, res) => changeSecuritySettings(req, res)));
