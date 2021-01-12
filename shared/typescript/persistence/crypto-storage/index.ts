// This file is part of the Trale Persistence.
//
// Trale Persistence is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Trale Persistence is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Trale Persistence.  If not, see <https://www.gnu.org/licenses/>.

import path               from 'path';
import * as fs from 'fs';
import {BinaryLike}       from 'crypto';

const RECORD_DELIMITER = 10;

export interface CryptoProvider {
  encrypt: (data: BinaryLike) => Buffer | Promise<Buffer>;
  decrypt: (encrypted: Buffer) => Buffer | Promise<Buffer>;
}

export class CryptoStorage {
  constructor(private _storageDirectory: string, private _crypt: CryptoProvider) {
  }

  get storageDirectory() {
    return this._storageDirectory;
  }

  async openTextRecordStorage(file: string[] | fs.promises.FileHandle, chunkSize: number = 16) {
    if (file instanceof Array) {
      file = await fs.promises.open(path.join(this._storageDirectory, ...file), 'a+');
    }
    return new TextRecordStorage(file, this._crypt, chunkSize);
  }

  async loadFileContent(file: string[] | fs.promises.FileHandle) {
    const fileOpenedByMethod = file instanceof Array;
    if (file instanceof Array) {
      file = await fs.promises.open(path.join(this._storageDirectory, ...file), 'r');
    }
    const content = await file.readFile();
    if (fileOpenedByMethod) {
      await file.close();
    }
    let decrypted = this._crypt.decrypt(content);
    if (decrypted instanceof Promise) {
      decrypted = await decrypted;
    }
    return decrypted;
  }

  async persistFileContent(file: string[], content: Buffer) {
    const fd = await fs.promises.open(path.join(this._storageDirectory, ...file), 'w');
    let encrypted = this._crypt.encrypt(content);
    if (encrypted instanceof Promise) {
      encrypted = await encrypted;
    }
    await fd.write(encrypted);
    await fd.close();
  }
}

export class TextRecordStorage {
  constructor(private _handle: fs.promises.FileHandle, private _crypt: CryptoProvider, private _chunkSize: number) {
  }

  async *records() {
    const stat = await this._handle.stat();
    let buf: string[] = [];

    for (let i = stat.size - 1 - this._chunkSize; ; i -= this._chunkSize) {
      if (i === (-this._chunkSize)) {
        break;
      }
      let chunkBuffer = Buffer.alloc(this._chunkSize);
      await this._handle.read(chunkBuffer, 0, this._chunkSize, Math.max(0, i));
      if (i < 0) {
        chunkBuffer = chunkBuffer.slice(0, this._chunkSize + i);
        buf = [...buf, ...chunkBuffer.toString('ascii').split('').reverse()];
        break;
      }
      chunkBuffer = Buffer.from(chunkBuffer.toString('ascii').split('').reverse().join(''), 'ascii');
      
      for (const b of chunkBuffer) {
        if (b === 0) {
          continue;
        } else if (b === RECORD_DELIMITER) {
          if (buf.length === 0) {
            continue;
          }
          const record = Buffer.from(buf.reverse().join(''), 'base64');
          if (record.length) {
            let decrypted = this._crypt.decrypt(record);
            if (decrypted instanceof Promise) {
              decrypted = await decrypted;
            }
            yield decrypted;
          }
          buf = [];
        } else {
          buf.push(String.fromCharCode(b));
        }
      }
    }
    const bufStr = buf.reverse().filter(x => x !== '\x00').join();
    if (bufStr.length === 0) {
      return;
    }
    const record = Buffer.from(bufStr, 'base64');
    let decrypted = this._crypt.decrypt(record);
    if (decrypted instanceof Promise) {
      decrypted = await decrypted;
    }
    yield decrypted;
  }

  async addRecord(data: Buffer) {
    let encrypted = this._crypt.encrypt(data);
    if (encrypted instanceof Promise) {
      encrypted = await encrypted;
    }
    const stat = await this._handle.stat();
    await this._handle.write(encrypted.toString('base64') + '\n', stat.size);
  }

  close() {
    return this._handle.close();
  }
}
