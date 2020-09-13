import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }
  public remoteEndpoint() {
    return 'http://localhost:3000';
  }
}
