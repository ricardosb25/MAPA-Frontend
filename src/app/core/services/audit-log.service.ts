import { Observable } from 'rxjs';
import { AuditLogModel, AuditLogQuery } from '../models/audit-log.model';
import { PageResponse } from '../models/pagination.model';

export abstract class AuditLogService {
  abstract getAuditLogsPage(query: AuditLogQuery): Observable<PageResponse<AuditLogModel>>;
}