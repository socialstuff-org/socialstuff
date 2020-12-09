import {Injectable}           from '@angular/core';
import {AppConfig}            from '../../environments/environment';
import * as fs                from 'fs';
import * as path              from 'path';
import * as os                from 'os';
import {CryptoStorageService} from './crypto-storage.service';
import {TitpServiceService}   from './titp-service.service';
import {ContactService}       from './contact.service';
import {ApiService}           from './api.service';
import {Router}               from '@angular/router';
import Swal                   from 'sweetalert2';
import {delay}                from '@socialstuff/utilities/common';
import {interval}             from 'rxjs';

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
    private router: Router,
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
    session.hostname && (this.api.hostname = session.hostname);
    session.port && (this.api.port = session.port);
    session.tralePort && (this.api.tralePort = session.tralePort);

    console.log('connecting to chat service...');
    await this.titp.connect(session.username, this.api.hostname, this.api.tralePort);
    console.log('did connect!');
    this.titp.client.onDisconnect().subscribe(async hadError => {
      Swal.fire({
        title: 'Disconnected!',
        text: 'Please wait until we can reconnect you.',
        allowOutsideClick: false,
        showCloseButton: false,
        showConfirmButton: false,
      });
      const intervalSub = interval(5000).subscribe(async () => {
        try {
          console.log('trying..');
          await this.titp.connect(session.username, this.api.hostname, this.api.tralePort);
        } catch {
          console.log('failed');
          return;
        }
        intervalSub.unsubscribe();
        Swal.close();
      });
    });

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
