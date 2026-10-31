import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AccountSettings, EmailChangeRequest, PasswordChangeRequest } from '../models/account-settings.model';
import { MessageResponse } from '../models/auth.model';
import { AccountSettingsService } from './account-settings.service';

@Injectable({ providedIn: 'root' })
export class HttpAccountSettingsService extends AccountSettingsService {
  constructor(private readonly httpClient: HttpClient) {
    super();
  }

  override getSettings(): Observable<AccountSettings> {
    return this.httpClient.get<AccountSettings>(API_CONFIG.endpoints.accountSettings);
  }

  override changeEmail(request: EmailChangeRequest): Observable<MessageResponse> {
    return this.httpClient.put<MessageResponse>(`${API_CONFIG.endpoints.accountSettings}/email`, request);
  }

  override changePassword(request: PasswordChangeRequest): Observable<MessageResponse> {
    return this.httpClient.put<MessageResponse>(`${API_CONFIG.endpoints.accountSettings}/password`, request);
  }
}
