import { Component, OnInit } from '@angular/core';
import {CryptoStorageService} from "../../services/crypto-storage.service";
import {createHash} from "crypto";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public username = '';
  public password = '';
  public password_confirm = '';
  public hostname = '127.0.0.1';
  public port = 8080;

  constructor(
    private cryptoStorage: CryptoStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    const hash = createHash('sha-512');
    hash.update('master_password');
    console.time('Crypto init');
    await this.cryptoStorage.load('maurits@code-lake.com:12345', hash.digest());
    console.timeEnd('Crypto init');
    console.log('Crypto Storage initialized!');
  }

  public register() {
    // TODO
  }

}
