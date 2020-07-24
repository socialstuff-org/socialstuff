import crypto from 'crypto';
import argon  from 'argon2';
import util   from 'util';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/** @var {Buffer} */
let _appSecretBytes;
/** @var {(arg1: number) => Promise<Buffer>} randomBytes */
export const randomBytes = util.promisify(crypto.randomBytes);

export function appSecretBytes() {
  if (!_appSecretBytes) {
    const h = crypto.createHash('sha256');
    h.update(process.env.APP_SECRET);
    _appSecretBytes = h.digest();
  }
  return _appSecretBytes;
}

export function hashHmac(data) {
  const hmac = crypto.createHmac('sha512', appSecretBytes());
  hmac.write(data);
  const hashPromise = new Promise(res => {
    hmac.on('readable', () => {
      res(hmac.read());
    });
  });
  hmac.end();
  return hashPromise;
}

export function verifyPublicKey(pk, signedData) {
  const foo = crypto.createVerify('');
}

export async function encrypt(data) {
  const iv = await randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, appSecretBytes(), iv);
  const encrypted = [];
  cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
      encrypted.push(chunk.toString('hex'));
    }
  });
  const encryptPromise = new Promise(res => {
    cipher.on('end', () => {
      const cryptText = JSON.stringify({iv: encodeStringToBase64(iv), value: encrypted.join('')});
      res(encodeStringToBase64(cryptText));
    });
  });
  cipher.write(data);
  cipher.end();
  return encryptPromise;
}

export function decrypt(data) {
  const {iv, value} = JSON.parse(decodeBase64ToString(data));
  const ivBuffer = Buffer.from(iv, 'base64');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, appSecretBytes(), ivBuffer);
  let decrypted = [];
  decipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = decipher.read())) {
      decrypted.push(chunk.toString('utf8'));
    }
  });
  const decryptPromise = new Promise(res => {
    decipher.on('end', () => {
      res(decrypted.join(''));
    });
  });
  decipher.write(value, 'hex');
  decipher.end();
  return decryptPromise;
}

export function encodeStringToBase64(data) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

export function decodeBase64ToString(data) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

export async function verifyHashUnique(h, plain) {
  const {hash, salt} = JSON.parse(decodeBase64ToString(h));
  return argon.verify(hash, plain, { secret: appSecretBytes(), salt });
}

export async function hashUnique(data) {
  const salt = crypto.randomBytes(64);
  const hash = await argon.hash(data, {secret: appSecretBytes(), salt});
  const hashString = JSON.stringify({hash, salt});
  return encodeStringToBase64(hashString);
}
