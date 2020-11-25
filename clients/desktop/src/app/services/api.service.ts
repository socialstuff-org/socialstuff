import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private endpoint = 'http://127.0.0.1:8086';

  constructor() { }

  /**
   * The remove endpoint of the reverse proxy via which all services may be accessed.
   */
  public remoteEndpoint(): string {
    return this.endpoint;
  }

  public updateRemoteEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }
}
