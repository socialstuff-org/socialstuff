import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  get port(): number {
    return this._port;
  }
  get hostname(): string {
    return this._hostname;
  }
  private endpoint = 'http://127.0.0.1:8086';
  private _hostname: string = '';
  private _port: number = 8086;
  private tralePort: number = 8087;

  constructor() { }

  /**
   * The HTTP remote endpoint of the reverse proxy, via which all services may be accessed.
   */
  public remoteEndpoint(): string {
    // return `http://${this.hostname}:${this.port}`;
    return this.endpoint;
  }

  public updateRemoteEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
    const [host,port] = endpoint.split('//')[1].split('/')[0].split(':');
    this._hostname = host;
    this._port = parseInt(port);
  }
}
