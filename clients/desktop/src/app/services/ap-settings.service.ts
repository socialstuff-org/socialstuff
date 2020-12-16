import {Injectable}                      from '@angular/core';
import {ApiService}                      from './api.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpErrorResponse, HttpResponse} from '../types';
import {SecuritySettings} from '../admin/interfaces/SecuritySettings';
import {InviteCode} from '../admin/interfaces/InviteCode';
import {ReportReason} from '../admin/interfaces/ReportReason';

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

  public getInviteCodes(): Promise<any> {

    let headers = new HttpHeaders().set('rows_per_page', '100');
    headers = headers.append('current_page', '1');

    return this.http.get<any>(this.api.remoteEndpoint() + '/invitations', {headers: headers}).toPromise();
  }

  /**
   * The InviteCode created in the "CreateNewInviteComponent" will be send to the back-end
   * @param inviteCode (id: string, code: string, max_usage: int, expiration_date: string)
   */

  public addInviteCode(inviteCode: InviteCode): Promise<any> {
    return this.http.post<any>((this.api.remoteEndpoint() + '/invitations'), inviteCode).toPromise();
  }

  public deleteInviteCode(id: number): Promise<any> {
    const headers = new HttpHeaders().set('id', id.toString());
    return this.http.delete<any>((this.api.remoteEndpoint() + '/invitations'), {headers: headers}).toPromise();
  }

  public getReportReasons(): Promise<Array<ReportReason>> {

    let headers = new HttpHeaders().set('rows_per_page', '100');
    headers = headers.append('current_page', '1');

    return this.http.get<any>(this.api.remoteEndpoint() + '/settings/report-reasons', {headers: headers}).toPromise();
  }

  public createReportReason(reportReason): Promise<ReportReason> {
    return this.http.post<any>((this.api.remoteEndpoint() + '/settings/report-reasons'), reportReason).toPromise();
  }

  public editReportReason(reportReason): Promise<ReportReason> {
    return this.http.put<any>((this.api.remoteEndpoint() + '/settings/report-reasons'), reportReason).toPromise();
  }

  public deleteReportReason(reportReason): Promise<any> {
    const headers = new HttpHeaders().set('id', reportReason.id.toString());
    return this.http.delete<any>((this.api.remoteEndpoint() + '/settings/report-reasons'), {headers: headers}).toPromise();
  }


}
