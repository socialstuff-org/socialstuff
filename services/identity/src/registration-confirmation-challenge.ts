// This file is part of SocialStuff.
//
// SocialStuff is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with SocialStuff.  If not, see <https://www.gnu.org/licenses/>.

import nodemailer, {SendMailOptions} from 'nodemailer';
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

export function hasChallenge(challenge: string) {
  return process.env.REGISTRATION_CHALLENGES?.includes(challenge);
}

export async function registrationConfirmationChallenge(registrationChallengeMode: 'response' | 'email', userInfo: { email: string, userId: string } | undefined) {
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
    const link = `${process.env.APP_BASE_URL}/verify/${token}`;
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
