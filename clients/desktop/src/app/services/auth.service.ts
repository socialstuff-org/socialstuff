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
    return new Promise<string>((res, rej) => {
      this.http.post<any>(this.api.remoteEndpoint() + '/identity/login', {username, password})
        .subscribe(response => {
          res(response.data.token);
        }, (error: HttpErrorResponse) => {
          if (error.status === 400) {
            rej('Invalid Credentials!')
          } else {
            rej(error.error.errors);
          }
        });
    })
  }
}
