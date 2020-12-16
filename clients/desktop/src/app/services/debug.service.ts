import {Injectable} from '@angular/core';
import {AppConfig} from '../../environments/environment';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {CryptoStorageService} from './crypto-storage.service';
import {TitpService}          from './titp.service';
import {ContactService}       from './contact.service';
import {ApiService} from './api.service';
import Swal from 'sweetalert2';
import {timer} from 'rxjs';
import { prefix } from '@trale/transport/log';

const log = prefix('clients/desktop/services/debug-service');

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private basePath = path.join(os.homedir(), '.trale');

  constructor(
    private storage: CryptoStorageService,
    private titp: TitpService,
    private contacts: ContactService,
    private api: ApiService,
  ) {
  }

  private async connectWithAnimation(session: any) {
    let now = new Date().toLocaleTimeString();
    const html = '<p>Please wait until we can connect you...</p>' +
      '<p>Please check your internet connection. If you are connected properly, please reach out to your server administrator.</p>' +
      '<p>Reconnecting since: ' + now + '<br>\n</p>' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; display: block; shape-rendering: auto;" width="100px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">\n' +
      '  <g transform="rotate(0 50 50)">\n' +
      '    <rect x="0" y="30.5" rx="0" ry="0" width="100" height="3" fill="#ee4540">\n' +
      '      <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>\n' +
      '    </rect>\n' +
      '  </g><g transform="rotate(120 50 50)">\n' +
      '  <rect x="0" y="30.5" rx="0" ry="0" width="100" height="3" fill="#ee4540">\n' +
      '    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>\n' +
      '  </rect>\n' +
      '</g><g transform="rotate(240 50 50)">\n' +
      '  <rect x="0" y="30.5" rx="0" ry="0" width="100" height="3" fill="#ee4540">\n' +
      '    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>\n' +
      '  </rect>\n' +
      '</g>\n' +
      '</svg>\n';

    Swal.fire({
      title: 'Disconnected!',
      html,
      allowOutsideClick: false,
      showCloseButton: false,
      showConfirmButton: false,
    });

    return new Promise<void>((res) => {
      const a = timer(0, 5000).subscribe(async n => {
        log('trying to connect...');
        try {
          await this.titp.connect(session.username, this.api.hostname, this.api.tralePort);
          a.unsubscribe();
          Swal.close();
          log('success!');
          res();
        } catch (e) {
          log('failed', n, ';error:', e);
        }
      })
    });
  }

  public async loadSession() {
    if (AppConfig.environment === 'PROD') {
      return false;
    }
    log('loading session');
    const sessionPath = path.join(this.basePath, '.debug_session');
    try {
      await fs.promises.stat(sessionPath);
    } catch {
      log('no debug session file found');
      return false;
    }
    const sessionString = (await fs.promises.readFile(sessionPath)).toString('utf8');
    const session = JSON.parse(sessionString);
    log('session data:', session);
    const result = {username: session.username, key: Buffer.from(session.key.data)};
    await this.storage.load(`${session.username}@${session.hostname}`, result.key);
    log('storage loaded');
    session.hostname && (this.api.hostname = session.hostname);
    session.port && (this.api.port = session.port);
    session.tralePort && (this.api.tralePort = session.tralePort);
    console.log('connecting to chat service...');
    this.titp.onConnectionStateChanged.subscribe(isConnected => {
      if (isConnected) {
        log('connected; listening for disconnects.');
        const _a = this.titp.client.onDisconnect().subscribe(hadError => {
          this.connectWithAnimation(session);
          _a.unsubscribe();
        });
      }
    });
    await this.connectWithAnimation(session);
    log('done with session loading');
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
