import {Injectable} from '@angular/core';

import {TitpClient}                                    from '@trale/transport/client';
import {CURVE}                                         from '@trale/transport/constants/crypto-algorithms';
import {KeyRegistryService}                            from './key-registry.service';
import {createECDH, createPrivateKey, createPublicKey} from 'crypto';
import {CryptoStorageService}                          from './crypto-storage.service';
import {ApiService}                                    from './api.service';
import {Subject}                                       from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TitpServiceService {
  get connected(): boolean {
    return this._connected;
  }
  get onConnectionStateChanged(): Subject<boolean> {
    return this._onConnectionStateChanged;
  }
  get client(): TitpClient {
    return this._client;
  }

  private _onConnectionStateChanged = new Subject<boolean>();
  private _connected = false;

  private _client: TitpClient;

  constructor(
    private keys: KeyRegistryService,
    private storage: CryptoStorageService,
    private api: ApiService
  ) {
  }

  async connect(username: string, host: string = '::1', port: number = 8086) {
    const hostRsa = await this.keys.fetchRsa('root');
    const rsaString = (await this.storage.storage.loadFileContent(['priv.pem'])).toString('utf-8');
    const rsa = {pub: createPublicKey(rsaString), priv: createPrivateKey(rsaString)};
    const ecdh = createECDH(CURVE);
    ecdh.generateKeys();
    const client = new TitpClient(username, rsa, ecdh, this.keys);
    await client.connect(hostRsa, host, port);
    this._client = client;
    this.keys.serverAddress = this.api.hostname;
    client.onDisconnect().subscribe(() => {
      this._onConnectionStateChanged.next(false);
      this._connected = false;
    });
    this._onConnectionStateChanged.next(true);
    this._connected = true;
  }
}
