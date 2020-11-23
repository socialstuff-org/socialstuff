import {Injectable} from '@angular/core';

import {TitpClient}                                    from '@trale/transport/client';
import {CURVE}                                         from '@trale/transport/constants/crypto-algorithms';
import {KeyRegistryService}                            from './key-registry.service';
import {generateRsaKeyPair}                            from '@socialstuff/utilities/security';
import {createECDH, createPrivateKey, createPublicKey} from 'crypto';
import {CryptoStorageService}                          from './crypto-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TitpServiceService {
  get client(): TitpClient {
    return this._client;
  }

  private _client: TitpClient;

  constructor(
    private keys: KeyRegistryService,
    private storage: CryptoStorageService,
  ) {
  }

  async connect(username: string, host: string = '::1', port: number = 8086) {
    const hostRsa = await this.keys.fetchRsa('root');
    const rsaString = (await this.storage.storage.loadFileContent(['priv.pem'])).toString('utf-8');
    const rsa = {pub: createPublicKey(rsaString), priv: createPrivateKey(rsaString)};
    const ecdh = createECDH(CURVE);
    ecdh.generateKeys();
    const client = new TitpClient(username, rsa, ecdh, this.keys);
    await client.connect(createPublicKey(hostRsa), host, port);
    this._client = client;
  }
}