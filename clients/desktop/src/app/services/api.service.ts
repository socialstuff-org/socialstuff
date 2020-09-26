import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private endpoint = 'http://127.0.0.1:8080';

  constructor() { }

  public remoteEndpoint() {
    return this.endpoint;
  }

  public updateRemoteEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }
}
