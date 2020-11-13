import {app} from 'electron';
import {CryptoProvider, CryptoStorage} from '@trale/persistence/crypto-storage';
import {Injectable} from '@angular/core';
import * as path from 'path';
import {hashUnique} from "@socialstuff/utilities/security";
import {BinaryLike, createCipheriv, createDecipheriv, createHash, randomBytes} from "crypto";
import * as fs from 'fs';

function cryptoProviderFactory(key: Buffer): CryptoProvider {
  return {
    encrypt(data: BinaryLike) {
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', key, Buffer.alloc(0));
      return Buffer.concat([iv, cipher.update(data), cipher.final()]);
    },
    decrypt(data: Buffer) {
      const iv = data.slice(0, 16);
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      return Buffer.concat([decipher.update(data.slice(16)), decipher.final()]);
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class CryptoStorageService {

  private _storage: CryptoStorage;
  private _path = path.join(app.getPath('home'), '.trale');
  private _masterKey: Buffer;

  constructor() {
  }

  public async load(username: string, key: Buffer) {
    const usernameHash = (() => {
      const sha = createHash('sha-512');
      sha.update(username);
      return sha.digest().toString('hex');
    })();
    this._path = path.join(this._path, usernameHash);
    {
      const pathStat = await fs.promises.stat(this._path);
      if (!pathStat.isDirectory()) {
        await fs.promises.mkdir(this._path);
      }
    }
    {
      const masterKeyPath = path.join(this._path, 'master.key');
      try {
        const maskedKey = await fs.promises.readFile(masterKeyPath);
        const decipher = createDecipheriv('aes-256-cbc', key, maskedKey.slice(0, 16));
        const masterKey = Buffer.concat([decipher.update(maskedKey.slice(16)), decipher.final()]);
        this._masterKey = masterKey;
      } catch (e) {
        this._masterKey = randomBytes(32);
        const iv = randomBytes(16);
        const cipher = createCipheriv('aes-256-cbc', key, iv);
        const maskedKey = Buffer.concat([iv, cipher.update(this._masterKey), cipher.final()]);
        await fs.promises.writeFile(masterKeyPath, maskedKey);
      }
    }

    this._storage = new CryptoStorage(this._path, cryptoProviderFactory(this._masterKey));
  }

  get storage(): CryptoStorage {
    return this._storage;
  }

}
