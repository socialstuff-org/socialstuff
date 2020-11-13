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

import {
  KeyObject,
  createHash,
  createHmac,
  BinaryLike,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  generateKeyPair,
  createSign,
  createPublicKey,
  createPrivateKey,
  createVerify, publicEncrypt, privateDecrypt,

} from 'crypto';
import * as argon from 'argon2';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

export const USERNAME_REGEX = /[a-z\d_.]{5,20}/.compile();

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

export function appSecretBytes() {
  if (!_appSecretBytes) {
    const h = createHash('sha256');
    if (!process.env.APP_SECRET) {
      throw new Error('Missing APP_SECRET environment variable!');
    }
    h.update(process.env.APP_SECRET);
    _appSecretBytes = h.digest();
  }
  return _appSecretBytes;
}

export function hashHmac(data: BinaryLike, key: Buffer = appSecretBytes()) {
  const hmac = createHmac('sha512', key);
  return hmac.update(data).digest('hex');
}

export function encrypt(data: Buffer | string, key: Buffer = appSecretBytes()) {
  if (!(data instanceof Buffer)) {
    data = Buffer.from(data, 'utf8');
  }
  const iv = randomBytes(16);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = cipher.update(data, undefined, 'base64') + cipher.final('base64');
  const cryptText = JSON.stringify({iv: iv.toString('base64'), value: encrypted});
  return base64encode(cryptText);
}

export function decrypt(data: string, key: Buffer = appSecretBytes()) {
  const {iv, value} = JSON.parse(base64decode(data));
  const ivBuffer = Buffer.from(iv, 'base64');
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, ivBuffer);
  const encrypted = Buffer.from(value, 'base64');
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function base64encode(data: string) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

export function base64decode(data: string) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

export function verifyHashUnique(h: string, plain: string, secret: Buffer = appSecretBytes()) {
  const {hash, salt} = JSON.parse(base64decode(h));
  return argon.verify(hash, plain, {secret, salt});
}

export async function hashUnique(data: any, secret?: Buffer) {
  if (!secret) {
    secret = appSecretBytes();
  }
  const salt = randomBytes(64);
  const hash = await argon.hash(data, {secret, salt});
  const hashString = JSON.stringify({hash, salt});
  return base64encode(hashString);
}

export function generateRsaKeyPair(modulusLength: number = 4096, passphrase?: string): Promise<{ pub: KeyObject, priv: KeyObject }> {
  const privateKeyEncoding: any = {
    type:   'pkcs8',
    format: 'pem',
  };
  if (passphrase) {
    privateKeyEncoding.cipher = 'aes-256-cbc';
    privateKeyEncoding.passphrase = passphrase;
  }
  return new Promise((res, rej) => {
    generateKeyPair('rsa', {
      modulusLength,
      publicKeyEncoding: {
        type:   'spki',
        format: 'pem',
      },
      privateKeyEncoding,
    }, ((err, publicKey, privateKey) => {
      if (err) {
        rej(err);
      } else {
        res({priv: createPrivateKey(privateKey), pub: createPublicKey(publicKey)});
      }
    }));
  });
}

export function wrapEnvelop(senderName: string, senderEcdhPub: Buffer, senderRsaPriv: KeyObject, receiverRsaPub: KeyObject) {
  const ecdhStr = senderEcdhPub.toString('base64');
  const signer = createSign('RSA-SHA512');
  signer.update(ecdhStr);
  const letter = {
    name:    senderName,
    ecdhSig: signer.sign(senderRsaPriv, 'base64'),
    ecdh:    ecdhStr,
  };
  const letterBuffer = Buffer.from(JSON.stringify(letter), 'utf8');
  const key = randomBytes(32);
  const letterEncrypted = encrypt(letterBuffer, key);
  const encryptedKey = publicEncrypt(receiverRsaPub, key);
  const envelop = {letter: letterEncrypted, key: encryptedKey.toString('base64')};
  return JSON.stringify(envelop);
}

export function openEnvelop(envelopStr: string, senderRsaPub: KeyObject, receiverRsaPriv: KeyObject) {
  const envelop = JSON.parse(envelopStr) as { letter: string, key: string };
  try {
    const key = privateDecrypt(receiverRsaPriv, Buffer.from(envelop.key, 'base64'));
    const letterStr = decrypt(envelop.letter, key).toString('utf-8');
    const letter = JSON.parse(letterStr) as { name: string, ecdhSig: string, ecdh: string };
    const verifier = createVerify('RSA-SHA512');
    verifier.update(letter.ecdh);
    if (!verifier.verify(senderRsaPub, letter.ecdhSig, 'base64')) {
      throw new Error();
    }
    return letter;
  } catch (e) {
    throw new Error('Sender verification failed!');
  }
}
