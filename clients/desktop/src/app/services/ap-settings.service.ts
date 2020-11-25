import {Injectable}                      from '@angular/core';
import {ApiService}                      from './api.service';
import {HttpClient}                      from '@angular/common/http';
import {HttpErrorResponse, HttpResponse} from '../types';
import {SecuritySettings} from '../admin/interfaces/SecuritySettings';

@Injectable({
  providedIn: 'root',
})
export class AdminSettings {
  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {
  }

  public getSecuritySettings(): Promise<SecuritySettings> {
    return this.http.get<any>(this.api.remoteEndpoint() + '/settings/security').toPromise();
  }

  public setSecuritySettings(currentSettings): Promise<SecuritySettings> {
    return this.http.put<any>((this.api.remoteEndpoint() + '/settings/security'), currentSettings).toPromise();

  }
}
