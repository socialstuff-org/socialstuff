import {HttpErrorResponse as AngularErrorResponse, HttpResponse as AngularResponse} from '@angular/common/http';

export type HttpResponse<T = any> = AngularResponse<{data: T}>

export type ValidationError = { location: string, msg: string, param: string, value?: string };

export type Dictionary<T = any> = { [key: string]: T };

export interface HttpErrorResponse<T = Dictionary<ValidationError>> extends AngularErrorResponse {
  error: {
    errors: Dictionary<ValidationError>
  }
}
