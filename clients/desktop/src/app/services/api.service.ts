import { Injectable } from '@angular/core';

/**
 * API Service
 *
 * Service responsible for managing API access
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _hostname = 'trale.org';
  private _port = 8086;
  private _remoteEndpoint = `http://${this._hostname}:${this._port}`;
  private _tralePort = 8087;

  constructor() { }

  /**
   * The HTTP remote endpoint of the reverse proxy, via which all services may be accessed.
   * @return {string} remoteEndpoint
   */
  public get remoteEndpoint(): string {
    // return `http://${this.hostname}:${this.port}`;
    return this._remoteEndpoint;
  }

  /**
   * TODO @joernneumeyer
   * @param {string} remoteEndpoint
   */
  public updateRemoteEndpoint(remoteEndpoint: string): void {
    this._remoteEndpoint = remoteEndpoint;
    const [host,port] = remoteEndpoint.split('//')[1].split('/')[0].split(':');
    this._hostname = host;
    this._port = parseInt(port);
  }

  /**
   * Getter for API hostname
   * @return {string} hostname
   */
  public get hostname(): string {
    return this._hostname;
  }

  /**
   * Setter for API hostname
   * @param {string} value The hostname
   */
  public set hostname(value: string) {
    this._hostname = value;
  }

  /**
   * Getter for API port
   * @return {number} port
   */
  public get port(): number {
    return this._port;
  }

  /**
   * Setter for API port
   * @param {number} value The port
   */
  public set port(value: number) {
    this._port = value;
  }

  /**
   * Getter for API Trale port
   * @return {number} tralePort
   */
  public get tralePort(): number {
    return this._tralePort;
  }

  /**
   * Setter for API Trale port
   * @param {number} value The Trale port
   */
  public set tralePort(value: number) {
    this._tralePort = value;
  }

}
