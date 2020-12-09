import {Injectable}           from '@angular/core';
import {AppConfig}            from '../../environments/environment';
import * as fs                from 'fs';
import * as path              from 'path';
import * as os                from 'os';
import {CryptoStorageService} from './crypto-storage.service';
import {TitpServiceService}   from './titp-service.service';
import {ContactService}       from './contact.service';
import {ApiService}           from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private basePath = path.join(os.homedir(), '.trale');

  constructor(
    private storage: CryptoStorageService,
    private titp: TitpServiceService,
    private contacts: ContactService,
    private api: ApiService,
  ) {
  }

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
    const result = {username: session.username, key: Buffer.from(session.key.data)};
    await this.storage.load(result.username, result.key);
    this.api.hostname = session.hostname;
    this.api.port = session.port;
    this.api.tralePort = session.tralePort;

    console.log('connecting to chat service...');
    await this.titp.connect(session.username, this.api.hostname, this.api.tralePort);
    console.log('did connect!');

    return result;
  }

  public async persistSession(username: string, key: Buffer) {
    if (AppConfig.environment === 'PROD') {
      return;
    }
    const hostname = this.api.hostname;
    const port = this.api.port;
    const tralePort = this.api.tralePort;
    await fs.promises.writeFile(path.join(this.basePath, '.debug_session'), JSON.stringify({
      username,
      key,
      hostname,
      port,
      tralePort,
    }));
  }

  public async destroySession() {
    await this.contacts.unLoad();
    await fs.promises.unlink(path.join(this.basePath, '.debug_session'));
  }
}
