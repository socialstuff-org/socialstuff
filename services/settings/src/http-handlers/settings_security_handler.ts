import {secSettings} from "../../res/settings_security";
import express from 'express';

function getSecSettings() {
    return secSettings;
}

function setTwoFactorAuth(two_factor_auth: boolean, email: boolean, phone: boolean) {
    secSettings.two_factor_auth = two_factor_auth;
    secSettings.email = email;
    secSettings.phone = phone;
}

var settingsInterface = express();
settingsInterface.get("/security-settings", (req, res) => {
    if (req.get("token") === ""){

    }
    res.send(getSecSettings())
})