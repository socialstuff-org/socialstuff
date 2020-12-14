import { Injectable } from '@angular/core';

/**
 * Service responsible for managing API access
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _hostname: string = 'trale.org';
  private _port: number = 8086;
  private endpoint = `http://${this._hostname}:${this._port}`;
  private _tralePort: number = 8087;

  constructor() { }

  /**
   * The HTTP remote endpoint of the reverse proxy, via which all services may be accessed.
   * @return endpoint
   */
  public remoteEndpoint(): string {
    // return `http://${this.hostname}:${this.port}`;
    return this.endpoint;
  }

  /**
   * TODO @joernneumeyer
   * @param endpoint
   */
  public updateRemoteEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
    const [host,port] = endpoint.split('//')[1].split('/')[0].split(':');
    this._hostname = host;
    this._port = parseInt(port);
  }

  /**
   * Setter for API port
   * @param value The port
   */
  set port(value: number) {
    this._port = value;
  }

  /**
   * Setter for API hostname
   * @param value The hostname
   */
  set hostname(value: string) {
    this._hostname = value;
  }

  /**
   * Setter for API Trale port
   * @param value The Trale port
   */
  set tralePort(value: number) {
    this._tralePort = value;
  }

  /**
   * Getter for API Trale port
   * @return tralePort
   */
  get tralePort(): number {
    return this._tralePort;
  }

  /**
   * Getter for API port
   * @return port
   */
  get port(): number {
    return this._port;
  }

  /**
   * Getter for API hostname
   * @return hostname
   */
  get hostname(): string {
    return this._hostname;
  }

}
