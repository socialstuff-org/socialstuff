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
export class TitpService {
  /**
   * Indicator, whether the client is connected or not.
   */
  get connected(): boolean {
    return this._connected;
  }
  /**
   * An {@link Observable} which emits as soon as the the client either connects or disconnects.
   */
  get onConnectionStateChanged(): Subject<boolean> {
    return this._onConnectionStateChanged;
  }
  /**
   * The underlying {@link TitpClient} instance.
   */
  get client(): TitpClient {
    return this._client;
  }
  /**
   * The hostname of the server to ehicvh the client is currently connected.
   */
  get host(): string {
    return this._host;
  }

  private _onConnectionStateChanged = new Subject<boolean>();
  private _connected = false;
  private _host: string;

  private _client: TitpClient;

  constructor(
    private keys: KeyRegistryService,
    private storage: CryptoStorageService,
    private api: ApiService
  ) {
  }

  /**
   * Attempts a connection to a Trale Chat server.
   * @param username The username to be usesd for authentication.
   * @param host The hostname of the Trale Chat server.
   * @param port The port of the Trale Chat server.
   */
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
    this._host = host;
  }
}
