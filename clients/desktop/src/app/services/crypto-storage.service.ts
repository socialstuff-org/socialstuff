import {Injectable}                                                            from '@angular/core';
import {CryptoProvider, CryptoStorage}                                         from '@trale/persistence/crypto-storage';
import { prefix } from '@trale/transport/log';
import {BinaryLike, createCipheriv, createDecipheriv, createHash, randomBytes} from 'crypto';
import * as fs                                                                 from 'fs';
import * as os                                                                 from 'os';
import * as path                                                               from 'path';
import {Observable, Subject}                                                   from 'rxjs';

const log = prefix('clients/desktop/services/crypto-storage');

function cryptoProviderFactory(key: Buffer): CryptoProvider {
  return {
    encrypt(data: BinaryLike) {
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      return Buffer.concat([iv, cipher.update(data), cipher.final()]);
    },
    decrypt(data: Buffer) {
      const iv = data.slice(0, 16);
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      return Buffer.concat([decipher.update(data.slice(16)), decipher.final()]);
    },
  };
}

@Injectable({
  providedIn: 'root',
})
export class CryptoStorageService {
  get path(): string {
    return this._path;
  }

  get masterKey(): Buffer {
    return this._masterKey;
  }

  get isLoaded(): Observable<void> {
    return this._isLoaded;
  }


  private _storage: CryptoStorage;
  private _path: string;
  private _masterKey: Buffer;
  private _isLoaded = new Subject<void>();

  public async load(username: string, key: Buffer) {
    log('loading storage for user:', username);
    this._path = path.join(os.homedir(), '.trale');
    // .trale main directory
    try {
      await fs.promises.stat(this._path);
    } catch (e) {
      await fs.promises.mkdir(this._path);
    }
    const usernameHash = createHash('sha512')
      .update(username)
      .digest()
      .toString('hex');
    // Trale user folder
    this._path = path.join(this._path, usernameHash);
    try {
      await fs.promises.stat(this._path);
    } catch (e) {
      await fs.promises.mkdir(this._path);
    }
    // Master key for encrypted storage
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
    const traleUserSpaceFolders = ['chats', 'media', 'handshakes'];
    // user space chat folder
    {
      for (const f of traleUserSpaceFolders) {
        const p = path.join(this._path, f);
        try {
          await fs.promises.stat(p);
        } catch (e) {
          await fs.promises.mkdir(p);
        }
      }
    }

    this._storage = new CryptoStorage(this._path, cryptoProviderFactory(this._masterKey));
    this._isLoaded.next();
  }

  get storage(): CryptoStorage {
    return this._storage;
  }

}
