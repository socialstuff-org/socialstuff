// This file is part of the TITP.
//
// TITP is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TITP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with TITP.  If not, see <https://www.gnu.org/licenses/>.

import {
  BinaryLike,
  createCipheriv,
  createDecipheriv,
  KeyObject,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
}                  from 'crypto';
import {SYMMETRIC} from '../constants/crypto-algorithms';

export function encryptRsa(data: BinaryLike, publicKey: KeyObject): Buffer {
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const encryptedKeys = publicEncrypt(publicKey, Buffer.concat([key, iv]));
  const keysLength = Buffer.alloc(2);
  keysLength.writeInt16BE(encryptedKeys.length, 0);
  return Buffer.concat([keysLength, encryptedKeys, encrypted]);
}

export function decryptRsa(data: Buffer, privateKey: KeyObject): Buffer {
  const keysLength = data.slice(0, 2);
  const keysBytesCount = keysLength.readInt16BE(0);
  const keyBytes = privateDecrypt(privateKey, data.slice(2, keysBytesCount + 2));
  data = data.slice(keysBytesCount + 2);
  const key = keyBytes.slice(0, 32);
  const iv = keyBytes.slice(32);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

export function encrypt(data: BinaryLike, key: Buffer, iv: Buffer = randomBytes(16)) {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([iv, cipher.update(data), cipher.final()]);
}

export function decrypt(data: Buffer, key: Buffer) {
  const iv = data.slice(0, 16);
  data = data.slice(16);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

