import {ApiService}        from './api.service';
import {HttpClient}        from '@angular/common/http';
import {HttpErrorResponse} from '../types';
import {Injectable}        from '@angular/core';

/**
 * Service responsible for managing authentication related tasks such as login, logout, registration etc.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {
  }

  /**
   * Attempt a login at a Trale backend server.
   * @param username
   * @param password
   */
  public login(username: string, password: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      this.http.post<any>(this.api.remoteEndpoint() + '/identity/login', {username, password})
        .subscribe(response => {
          res(response.data.token);
        }, (error: HttpErrorResponse) => {
          console.log(error);
          if (error.status === 400) {
            rej('Invalid Credentials!')
          } else {
            rej(error.error.errors);
          }
        });
    });
  }
}
