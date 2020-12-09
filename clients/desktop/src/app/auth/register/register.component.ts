import {Component, OnInit}           from '@angular/core';
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPair,
  KeyObject,
  privateDecrypt,
}                                    from 'crypto';
import {HttpClient}                  from '@angular/common/http';
import {ApiService}                  from '../../services/api.service';
import {CryptoStorageService}        from '../../services/crypto-storage.service';
import sweetalert                    from 'sweetalert2';
import {DataResponse, ErrorResponse} from '@socialstuff/utilities/responses';

function newKeyPair(mod) {
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

@Component({
  selector:    'app-register',
  templateUrl: './register.component.html',
  styleUrls:   ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  public username = '';
  public password = '';
  public password_confirm = '';
  public hostname = '';
  public port = 8086;
  public inviteCodeRequired = false;
  public inviteCode = '';

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: CryptoStorageService,
  ) {
  }

  ngOnInit(): void {
    this.hostname = this.api.hostname;
    this.port = this.api.port;
  }

  async foo() {
    this.api.updateRemoteEndpoint(`http://${this.hostname}:${this.port}`);
    try {
      await this.http.post<ErrorResponse>(this.api.remoteEndpoint() + '/identity/register', {}).toPromise();
    } catch (e) {
      if (e.error.errors.invite) {
        this.inviteCodeRequired = true;
      }
    }
  }

  public async register() {
    const keys = (await newKeyPair(4096)) as { pub: KeyObject, priv: KeyObject };
    let decryptedToken: Buffer;
    try {
      const response = await this.http.post<DataResponse<{ message: string, mfa_seed: string, token: string }>>
      (this.api.remoteEndpoint() + '/identity/register', {
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
      await this.http.post<DataResponse<{ message: string }>>(this.api.remoteEndpoint() + '/identity/register/confirm', {
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

    const hash = (() => {
      const hash = createHash('sha256');
      hash.update(this.password);
      return hash.digest();
    })();
    const userHandle = this.username + '@' + this.hostname + ':' + this.port;
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
  }

}
