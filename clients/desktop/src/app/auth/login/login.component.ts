import {Component, OnInit}    from '@angular/core';
import {Router}               from '@angular/router';
import {AuthService}          from '../../services/auth.service';
import {ApiService}           from '../../services/api.service';
import {AppConfigService}     from '../../services/app-config.service';
import {CryptoStorageService} from '../../services/crypto-storage.service';
import {DebugService}         from '../../services/debug.service';
import {createHash}           from 'crypto';
import sweetalert             from 'sweetalert2';

/**
 * Login component
 *
 * Component responsible for handling login operations.
 */
@Component({
  selector:    'app-login',
  templateUrl: './login.component.html',
  styleUrls:   ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public hostname = '';
  public port = 8086;
  public loggingIn = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private config: AppConfigService,
    private storage: CryptoStorageService,
    private debug: DebugService,
    private router: Router,
  ) {
  }

  /**
   * Retrieve default API port and hostname from {@link ApiService}. Load session from {@link DebugService}. If a valid session is found,
   * redirect to landing component.
   * @return {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    this.port = this.api.port;
    this.hostname = this.api.hostname;
    const session = await this.debug.loadSession();
    if (session === false) {
      return;
    }
    this.router.navigateByUrl('/landing');
  }

  /**
   * Responsible for handling login attempts.
   *
   * loggingIn will be set to true for loading animation handling. Update remote endpoint with entered hostname and port
   * data. Attempt a login on Trale server with provided credentials.
   *
   * If attempt was successful load user storage from local drive and persist session token. Store current session in
   * debug session for development. Set loggingIn to false to stop animation. Redirect to chat application.
   *
   * If attempt was unsuccessful fire sweetalert error and set status of loggingIn to false.
   * @return {Promise<void>}
   */
  public async login(): Promise<void> {
    this.loggingIn = true;
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    try {
      const token = await this.auth.login(this.username, this.password);
      const userHandle = `${this.username}@${this.hostname}`;
      const hash = createHash('sha256');
      hash.update(this.password);
      const key = hash.digest();
      await this.storage.load(userHandle, key);
      await this.storage.storage.persistFileContent(['session.token'], Buffer.from(token, 'utf8'));
      await this.debug.persistSession(this.username, key);
      this.loggingIn = false;
      this.router.navigateByUrl('/chat-app');
    } catch (e) {
      this.loggingIn = false;
      if (typeof e === 'string') {
        await sweetalert.fire({
          text:            e,
          title:           'Something\'s wrong, I can feel it!',
          showCloseButton: true,
        });
      } else {
        console.error(e);
        // TODO print custom error messages
      }
    }
  }

  /**
   * Responsible for redirecting to forgot password component.
   */
  public forgotPassword(): void {
    this.router.navigateByUrl('/forgot-password');
  }

}
