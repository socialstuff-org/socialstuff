import {Injectable}                      from '@angular/core';
import {ApiService}                      from './api.service';
import {HttpClient}                      from '@angular/common/http';
import {HttpErrorResponse, HttpResponse} from '../types';
import {ServerSettings} from '../admin/interfaces/ServerSettings';

@Injectable({
  providedIn: 'root',
})
export class AdminSettings {
  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {
  }

  public getSettings(): Promise<ServerSettings> {
    return this.http.get<any>(this.api.remoteEndpoint() + '/settings/security').toPromise();
  }

  public setSettings(currentSettings): Promise<ServerSettings> {
    return this.http.put<any>((this.api.remoteEndpoint() + '/settings/security'), currentSettings).toPromise();

  }
}
