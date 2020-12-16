import {CryptoProvider, CryptoStorage}                from '../crypto-storage';
import {BinaryLike, createCipheriv, createDecipheriv} from 'crypto';
import fs                                             from 'fs';
import path                                           from 'path';

const key = Buffer.alloc(32);
const iv = Buffer.alloc(16);

async function take<T>(iter: AsyncGenerator<T>, num: number) {
  const result: T[] = [];
  for await (const i of iter) {
    result.push(i);
    if (--num === 0) {
      break;
    }
  }
  return result;
}

const crypt: CryptoProvider = {
  encrypt(data: BinaryLike) {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  },
  decrypt(data: Buffer) {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  },
};

const samples = [
  'Hello, World!',
  'This some sample text.',
  'The EU decides on crappy guidelines.',
  'Maybe Trump should be the winner?',
];

(async () => {
  const s = new CryptoStorage(__dirname, crypt);
  // const f = await s.openTextRecordStorage(['foo.txt']);
  // await Promise.all(samples.map(x => f.addRecord(Buffer.from(x, 'utf8'))));
  // const records = await take(f.records(), 2);
  // console.log(records.map(x => x.toString('utf8')));
  // await f.close();
  const r = await s.openTextRecordStorage(['foo.txt']);
  // await r.addRecord(Buffer.from('Hello World!'));
  await r.addRecord(Buffer.from('foobar!'));
  for await (const rec of r.records()) {
    console.log(rec.toString('utf8'));
  }
})();
