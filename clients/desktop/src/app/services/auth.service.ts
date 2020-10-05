import {Injectable}                      from '@angular/core';
import {ApiService}                      from './api.service';
import {HttpClient}                      from '@angular/common/http';
import {HttpErrorResponse, HttpResponse} from '../types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {
  }

  public login(username: string, password: string) {
    this.http.post<any>(this.api.remoteEndpoint() + '/identity/login', {username, password})
      .subscribe((response: HttpResponse) => {
        console.log(response);
        alert('logged in!');
      }, (error: HttpErrorResponse) => {
        if (error.status === 400) {
          console.log('invalid credentials!');
        } else {
          console.log('unknown error!');
        }
        console.error(error.error.errors);
        alert('log in failed!');
      });
  }
}
