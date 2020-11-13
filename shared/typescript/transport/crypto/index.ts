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

/**
 * Encrypts the given data using a 384 bit key.
 * The decryption expects the incoming data to be properly formatted.
 * @param data The data to be decrypted.
 * @param key The 384 bit key to be used for the decryption.
 */
export function decryptAes384(data: Buffer, key: Buffer): Buffer {
  const ivB = data.slice(0, 16);
  const encB = data.slice(16);
  const decipherB = createDecipheriv(SYMMETRIC, key.slice(24), ivB);
  const decB = Buffer.concat([decipherB.update(encB), decipherB.final()]);
  const ivA = decB.slice(0, 16);
  const encA = decB.slice(16);
  const decipherA = createDecipheriv(SYMMETRIC, key.slice(0, 24), ivA);
  return Buffer.concat([decipherA.update(encA), decipherA.final()]);
}

/**
 * Encrypts the given data using a 384 bit key.
 * The encryption is performed by applying aes-192 twice, with two varying initialization vectors.
 * @param data The data to be encrypted.
 * @param key
 * @param config
 */
export function encryptAes384(data: BinaryLike, key: Buffer, config?: { iv?: Buffer }): Buffer {
  const ivA = config?.iv?.slice(0, 16) || randomBytes(16);
  const ivB = config?.iv?.slice(16) || randomBytes(16);
  const keyA = key.slice(0, 24);
  const keyB = key.slice(24);
  const cipherA = createCipheriv(SYMMETRIC, keyA, ivA);
  const cipherB = createCipheriv(SYMMETRIC, keyB, ivB);
  const encA = Buffer.concat([ivA, cipherA.update(data), cipherA.final()]);
  const encB = Buffer.concat([ivB, cipherB.update(encA), cipherB.final()]);
  return encB;
}
