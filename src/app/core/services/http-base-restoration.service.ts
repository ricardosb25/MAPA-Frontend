import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { MessageResponse } from '../models/auth.model';
import { BaseRestorationService, PresentationModeStatus } from './base-restoration.service';

@Injectable({ providedIn: 'root' })
export class HttpBaseRestorationService extends BaseRestorationService {
  constructor(private readonly httpClient: HttpClient) {
    super();
  }

  override getPresentationMode(): Observable<PresentationModeStatus> {
    return this.httpClient.get<PresentationModeStatus>(`${API_CONFIG.endpoints.adminSettings}/presentation-mode`);
  }

  override setPresentationMode(enabled: boolean): Observable<PresentationModeStatus> {
    return this.httpClient.put<PresentationModeStatus>(
      `${API_CONFIG.endpoints.adminSettings}/presentation-mode/${enabled}`, {});
  }

  override restoreMotors(): Observable<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${API_CONFIG.endpoints.adminSettings}/restore-motors`, {});
  }

  override restoreMaps(): Observable<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${API_CONFIG.endpoints.adminSettings}/restore-maps`, {});
  }
}
