import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogModel, AuditLogQuery } from '../models/audit-log.model';
import { PageResponse } from '../models/pagination.model';
import { AuditLogService } from './audit-log.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpAuditLogService implements AuditLogService {
  private readonly auditLogsEndpointUrl = API_CONFIG.endpoints.auditLogs;

  constructor(private readonly httpClient: HttpClient) {}

  getAuditLogsPage(query: AuditLogQuery): Observable<PageResponse<AuditLogModel>> {
    let queryParams = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sort', query.sort);

    if (query.level !== null) {
      queryParams = queryParams.set('level', query.level);
    }

    const normalizedSearch = query.search.trim();
    if (normalizedSearch !== '') {
      queryParams = queryParams.set('search', normalizedSearch);
    }

    return this.httpClient.get<PageResponse<AuditLogModel>>(this.auditLogsEndpointUrl, {
      params: queryParams
    });
  }
}