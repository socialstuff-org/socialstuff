import { Component, OnInit }  from '@angular/core';
import {AuthService}          from '../../services/auth.service';
import {ApiService}           from '../../services/api.service';
import {AppConfigService}     from '../../services/app-config.service';
import {Router}               from '@angular/router';
import sweetalert             from 'sweetalert2';
import {createHash}           from 'crypto';
import {CryptoStorageService} from '../../services/crypto-storage.service';
import {DebugService}         from '../../services/debug.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public hostname = '127.0.0.1';
  public port = 8086;
  public loggingIn = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private config: AppConfigService,
    private router: Router,
    private storage: CryptoStorageService,
    private debug: DebugService,
  ) { }

  async ngOnInit() {
    const session = await this.debug.loadSession();
    if (session === false) {
      return;
    }
    this.router.navigateByUrl('/landing');
  }

  public async login() {
    this.loggingIn = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    try {
      const token = await this.auth.login(this.username, this.password);
      const userHandle = `${this.username}@${this.hostname}:${this.port}`;
      const hash = createHash('sha256');
      hash.update(this.password);
      const key = hash.digest();
      await this.storage.load(userHandle, key);
      await this.storage.storage.persistFileContent(['session.token'], Buffer.from(token, 'utf8'));
      await this.debug.persistSession(userHandle, key);
      this.loggingIn = false;
      this.router.navigateByUrl('/landing');
    } catch (e) {
      this.loggingIn = false;
      if (typeof e === 'string') {
        await sweetalert.fire({
          text: e,
          title: 'Something\'s wrong, I can feel it!',
          showCloseButton: true,
        });
      } else {
        console.error(e);
        // TODO print custom error messages
      }
    }
  }

  public forgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

}
