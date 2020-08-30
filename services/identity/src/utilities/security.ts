// This file is part of SocialStuff Identity.
//
// SocialStuff Identity is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Identity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

import crypto from 'crypto';
import argon  from 'argon2';
import util   from 'util';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

export const USERNAME_REGEX = /[\w\d_.]{5,20}/.compile();

const LOWER_WORD_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPER_WORD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '1234567890';
const SPECIAL_CHARS = '!@#$%^&*()-_=+[]{};\'":,.<>/?`~€';
export const REQUIRED_PASSWORD_LENGTH = {min: 10, max: 40};

export function passwordIssues(password: string) {
  let hasLower = false;
  let hasUpper = false;
  let hasNumber = false;
  let hasSpecial = false;
  for (const c of password) {
    if (LOWER_WORD_CHARS.includes(c)) {
      hasLower = true;
    } else if (UPPER_WORD_CHARS.includes(c)) {
      hasUpper = true;
    } else if (NUMBER_CHARS.includes(c)) {
      hasNumber = true;
    } else if (SPECIAL_CHARS.includes(c)) {
      hasSpecial = true;
    }
  }
  const result: { [key: string]: string } = {};
  if (!hasSpecial) {
    result.special = 'Missing special character!';
  }
  if (!hasLower) {
    result.lower = 'Missing lower case character!';
  }
  if (!hasUpper) {
    result.upper = 'Missing upper case character!';
  }
  if (!hasNumber) {
    result.number = 'Missing number!';
  }
  if (password.length < REQUIRED_PASSWORD_LENGTH.min) {
    result.length = 'Password is too short!';
  } else if (password.length > REQUIRED_PASSWORD_LENGTH.max) {
    result.length = 'Password is too long!';
  }
  return result;
}

/** @var {Buffer} */
let _appSecretBytes: Buffer;
/** @var {(arg1: number) => Promise<Buffer>} randomBytes */
export const randomBytes = util.promisify(crypto.randomBytes);

export function appSecretBytes() {
  if (!_appSecretBytes) {
    const h = crypto.createHash('sha256');
    h.update(process.env.APP_SECRET as string);
    _appSecretBytes = h.digest();
  }
  return _appSecretBytes;
}

export function hashHmac(data: any) {
  const hmac = crypto.createHmac('sha512', appSecretBytes());
  hmac.write(data);
  const hashPromise = new Promise<string>(res => {
    hmac.on('readable', () => {
      const data = hmac.read();
      if (data) {
        res(data);
      }
    });
  });
  hmac.end();
  return hashPromise;
}

export async function encrypt(data: any) {
  const iv = await randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, appSecretBytes(), iv);
  const encrypted: string[] = [];
  cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
      encrypted.push(chunk.toString('hex'));
    }
  });
  const encryptPromise = new Promise<string>(res => {
    cipher.on('end', () => {
      const cryptText = JSON.stringify({iv: iv.toString('base64'), value: encrypted.join('')});
      res(base64encode(cryptText));
    });
  });
  cipher.write(data);
  cipher.end();
  return encryptPromise;
}

export function decrypt(data: string) {
  const {iv, value} = JSON.parse(base64decode(data));
  const ivBuffer = Buffer.from(iv, 'base64');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, appSecretBytes(), ivBuffer);
  const decrypted: string[] = [];
  decipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = decipher.read())) {
      decrypted.push(chunk.toString('utf8'));
    }
  });
  const decryptPromise = new Promise<string>(res => {
    decipher.on('end', () => {
      res(decrypted.join(''));
    });
  });
  decipher.write(value, 'hex');
  decipher.end();
  return decryptPromise;
}

export function base64encode(data: string) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

export function base64decode(data: string) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

export async function verifyHashUnique(h: string, plain: string) {
  const {hash, salt} = JSON.parse(base64decode(h));
  return argon.verify(hash, plain, {secret: appSecretBytes(), salt});
}

export async function hashUnique(data: any) {
  const salt = crypto.randomBytes(64);
  const hash = await argon.hash(data, {secret: appSecretBytes(), salt});
  const hashString = JSON.stringify({hash, salt});
  return base64encode(hashString);
}
