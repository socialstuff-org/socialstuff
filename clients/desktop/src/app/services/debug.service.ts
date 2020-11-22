import { Injectable }         from '@angular/core';
import {AppConfig}            from '../../environments/environment';
import * as fs                from 'fs';
import * as path              from 'path';
import * as os                from 'os';
import {CryptoStorageService} from './crypto-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private basePath = path.join(os.homedir(), '.trale');

  constructor(
    private storage: CryptoStorageService,
  ) { }

  public async loadSession() {
    if (AppConfig.environment === 'PROD') {
      return false;
    }
    const sessionPath = path.join(this.basePath, '.debug_session');
    try {
      await fs.promises.stat(sessionPath);
    } catch {
      return false;
    }
    const sessionString = (await fs.promises.readFile(sessionPath)).toString('utf8');
    const session = JSON.parse(sessionString);
    const result = { username: session.username, key: Buffer.from(session.key.data) };
    await this.storage.load(result.username, result.key);
    return result;
  }

  public async persistSession(username: string, key: Buffer) {
    if (AppConfig.environment === 'PROD') {
      return;
    }
    await fs.promises.writeFile(path.join(this.basePath, '.debug_session'), JSON.stringify({username, key}));
  }
}
