import nodemailer, {SendMailOptions} from 'nodemailer';
import {registrationChallengeMode}   from '../constants';
import {sharedConnection}            from './mysql';
import {v1 as v1uuid}                from 'uuid';

const transporter = nodemailer.createTransport({
  from:     'root@' + process.env.APP_HOSTNAME,
  subject:  'SocialStuff Identity Confirmation',
  sendmail: true,
  newline:  'unix',
  path:     '/usr/sbin/sendmail',
});

function sendMail(options: SendMailOptions) {
  return new Promise((res, rej) => {
    transporter.sendMail(options, (err, info) => {
      if (err) {
        rej(err);
      } else {
        res(info);
      }
    });
  });
}

export async function registrationConfirmationChallenge(userInfo: { email: string, userId: string } | undefined) {
  const token = v1uuid();
  switch (registrationChallengeMode) {
  case 'response':
    return token;
  case 'email':
  {
    if (!userInfo) {
      throw new Error('Missing user info for email registration confirmation!');
    }
    const db = await sharedConnection();
    const addRegistrationConfirmationSql = 'INSERT INTO registration_confirmations(expires_at, secret, id_user) VALUES (DATE_ADD(NOW(), INTERVAL 1 DAY), ?, unhex(?));';
    const link = `http://${process.env.APP_HOSTNAME}/verify/${token}`;
    const mailOptions: nodemailer.SendMailOptions = {
      to:   userInfo.email,
      text: `Please confirm your registration by visiting this link ${link}`,
      html: `Please confirm your registration by visiting this link <a href="${link}">${link}</a>.`,
    };
    await db.query(addRegistrationConfirmationSql, [token, userInfo.userId]);
    sendMail(mailOptions); // TODO fix no mail error
    return;
  }
  }
  throw new Error(`Invalid challenge mode '${registrationChallengeMode}'!`);
}
