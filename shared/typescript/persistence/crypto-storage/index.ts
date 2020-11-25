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

const RECORD_DELIMITER = Buffer.from('\n', 'ascii');

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

  async openTextRecordStorage(file: string[] | fs.promises.FileHandle) {
    if (file instanceof Array) {
      file = await fs.promises.open(path.join(this._storageDirectory, ...file), 'r+');
    }
    return new TextRecordStorage(file, this._crypt);
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
  constructor(private _handle: fs.promises.FileHandle, private _crypt: CryptoProvider) {
  }

  async *records() {
    const stat = await this._handle.stat();
    let buf = [];

    for (let i = stat.size - 1; i >= 0; --i) {
      const b = Buffer.alloc(1);
      await this._handle.read(b, 0, 1, i);
      if (b.equals(RECORD_DELIMITER)) {
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
        buf.push(b.toString('ascii'));
      }
    }
    const record = Buffer.from(buf.reverse().join(''), 'base64');
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
