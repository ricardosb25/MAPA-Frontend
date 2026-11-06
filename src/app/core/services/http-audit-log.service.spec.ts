import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpAuditLogService } from './http-audit-log.service';
import { AuditLogModel, AuditLogQuery } from '../models/audit-log.model';
import { PageResponse } from '../models/pagination.model';
import { API_CONFIG } from '../config/api.config';

describe('HttpAuditLogService', () => {
  let service: HttpAuditLogService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpAuditLogService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(HttpAuditLogService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const baseQuery: AuditLogQuery = {
    search: '',
    level: null,
    page: 0,
    size: 10,
    sort: 'createdAt,DESC'
  };

  const buildLog = (overrides: Partial<AuditLogModel> = {}): AuditLogModel => ({
    id: 1,
    action: 'USER_CREATED',
    actionLabel: 'Usuário criado',
    level: 'INFO',
    actorId: 1,
    actorEmail: 'admin@mapa.test',
    targetUserId: 7,
    targetEmail: 'ana@email.com',
    details: 'Conta criada pelo administrador',
    createdAt: '2026-09-27T21:14:00Z',
    ...overrides
  });

  const buildPage = (content: AuditLogModel[]): PageResponse<AuditLogModel> => ({
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
    sort: 'createdAt: DESC'
  });

  const matchesAuditLogsRequest = (request: HttpRequest<unknown>): boolean =>
    request.method === 'GET' && request.url === API_CONFIG.endpoints.auditLogs;

  it('should fetch audit logs with pagination params and read the page envelope', () => {
    service.getAuditLogsPage(baseQuery).subscribe((logsPage) => {
      expect(logsPage.content.length).toBe(1);
      expect(logsPage.totalElements).toBe(1);
      expect(logsPage.content[0].actionLabel).toBe('Usuário criado');
      expect(logsPage.content[0].level).toBe('INFO');
    });

    const pageRequest = httpTestingController.expectOne(matchesAuditLogsRequest);
    expect(pageRequest.request.params.get('page')).toBe('0');
    expect(pageRequest.request.params.get('size')).toBe('10');
    expect(pageRequest.request.params.get('sort')).toBe('createdAt,DESC');
    expect(pageRequest.request.params.has('level')).toBe(false);
    expect(pageRequest.request.params.has('search')).toBe(false);
    pageRequest.flush(buildPage([buildLog()]));
  });

  it('should send the level and the trimmed search as query params', () => {
    service
      .getAuditLogsPage({ ...baseQuery, level: 'AVISO', search: '  ana@email  ' })
      .subscribe();

    const pageRequest = httpTestingController.expectOne(matchesAuditLogsRequest);
    expect(pageRequest.request.params.get('level')).toBe('AVISO');
    expect(pageRequest.request.params.get('search')).toBe('ana@email');
    pageRequest.flush(buildPage([]));
  });
});