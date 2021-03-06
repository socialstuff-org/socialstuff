import {AfterViewInit, Component, OnInit} from '@angular/core';
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPair,
  KeyObject,
  privateDecrypt,
}                                         from 'crypto';
import {HttpClient}                  from '@angular/common/http';
import {ApiService}                  from '../../services/api.service';
import {CryptoStorageService}        from '../../services/crypto-storage.service';
import sweetalert                    from 'sweetalert2';
import {DataResponse, ErrorResponse} from '@socialstuff/utilities/responses';
import { Router } from '@angular/router';

/**
 * Simple wrapper for RSA key generation.
 */
function newKeyPair(mod: number) {
  return new Promise((res, rej) => {
    generateKeyPair('rsa', {
      modulusLength:      mod,
      publicKeyEncoding:  {
        type:   'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type:   'pkcs8',
        format: 'pem',
      },
    }, (err, pub, priv) => {
      if (err) {
        rej(err);
      } else {
        res({priv: createPrivateKey(priv), pub: createPublicKey(pub)});
      }
    });
  });
}

/**
 * Register component
 *
 * Responsible for handling registration attempts
 */
@Component({
  selector:    'app-register',
  templateUrl: './register.component.html',
  styleUrls:   ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, AfterViewInit {

  public username = '';
  public password = '';
  public passwordConfirm = '';
  public hostname = '';
  public port = 8086;
  public inviteCodeRequired = false;
  public inviteCode = '';

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: CryptoStorageService,
    private router: Router
  ) {
  }

  /**
   * After component initialization request whether default server requires an invite token
   */
  async ngAfterViewInit(): Promise<void> {
    await this.checkForInviteTokenRequired();
  }

  /**
   * Retrieve default API port and hostname from API service.
   */
  ngOnInit(): void {
    this.hostname = this.api.hostname;
    this.port = this.api.port;
  }

  /**
   * Responsible for checking at the entered server address whether an invite code is required for registration. If so
   * an input field asking for an invite token will be displayed.
   *
   * @return{Promise<void>}
   */
  async checkForInviteTokenRequired(): Promise<void> {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    try {
      await this.http.post<ErrorResponse>(this.api.remoteEndpoint + '/identity/register', {}).toPromise();
    } catch (e) {
      if (e.error.errors.invite) {
        this.inviteCodeRequired = true;
      }
    }
  }

  /**
   * Attempts a registration at a SocialStuff Identity server.
   * TODO move to auth.service.ts
   *
   * @return{Promise<void>}
   */
  public async register(): Promise<void> {
    const keys = (await newKeyPair(4096)) as { pub: KeyObject, priv: KeyObject };
    let decryptedToken: Buffer;
    try {
      const response = await this.http.post<DataResponse<{ message: string, mfa_seed: string, token: string }>>
      (this.api.remoteEndpoint + '/identity/register', {
        username:   this.username,
        password:   this.password,
        public_key: keys.pub.export({type: 'pkcs1', format: 'pem'}).toString(),
        invite:     this.inviteCode,
      }).toPromise();
      decryptedToken = privateDecrypt(keys.priv, Buffer.from(response.data.token, 'base64'));
    } catch (e) {
      if (e.error?.errors?.invite) {
        this.inviteCodeRequired = true;
      }
      console.log(e);
      let errorMessage = '';
      for (const name in e.error.errors) {
        errorMessage += `${name}: ${e.error.errors[name].msg}\n`;
      }
      await sweetalert.fire({
        text:            errorMessage,
        title:           'Something\'s wrong, I can feel it!',
        showCloseButton: true,
      });
      return;
    }
    try {
      await this.http.post<DataResponse<{ message: string }>>(this.api.remoteEndpoint + '/identity/register/confirm', {
        token: decryptedToken.toString('utf-8'),
      }).toPromise();
    } catch (e) {
      console.log(e);
      await sweetalert.fire({
        title:           'Registration confirmation failed!',
        showCloseButton: true,
      });
      return;
    }

    const hash = createHash('sha256').update(this.password).digest();
    const userHandle = this.username + '@' + this.hostname;
    await this.storage.load(userHandle, hash);
    await Promise.all([
      this.storage.storage.persistFileContent(['priv.pem'], Buffer.from(keys.priv.export({
        format: 'pem',
        type:   'pkcs1',
      }).toString(), 'utf-8')),
      this.storage.storage.persistFileContent(['pub.pem'], Buffer.from(keys.pub.export({
        format: 'pem',
        type:   'pkcs1',
      }).toString(), 'utf-8')),
    ]);
    await sweetalert.fire({
      title:           'Registration confirmation successful!',
      showCloseButton: true,
    });
    await this.router.navigate(['/', 'login']);
  }

}
