import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LogsPageComponent } from './logs-page.component';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuditLogModel, AuditLogQuery } from '../../../../core/models/audit-log.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { UserModel } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';

const buildLog = (overrides: Partial<AuditLogModel> = {}): AuditLogModel => ({
  id: 1,
  action: 'USER_CREATED',
  actionLabel: 'Usuário criado',
  level: 'INFO',
  actorId: 9,
  actorEmail: 'admin@mapa.test',
  targetUserId: 7,
  targetEmail: 'ana@email.com',
  details: 'Conta criada pelo administrador',
  createdAt: '2026-09-27T21:14:00Z',
  ...overrides
});

const buildLogsPage = (logs: AuditLogModel[]): PageResponse<AuditLogModel> => ({
  content: logs,
  page: 0,
  size: 10,
  totalElements: logs.length,
  totalPages: logs.length > 0 ? 1 : 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
  sort: 'createdAt: DESC'
});

const buildAuditLogServiceStub = (logs: AuditLogModel[]) => {
  const receivedQueries: AuditLogQuery[] = [];
  return {
    receivedQueries,
    service: {
      getAuditLogsPage: (query: AuditLogQuery) => {
        receivedQueries.push(query);
        return of(buildLogsPage(logs));
      }
    }
  };
};

const buildUser = (role: UserProfileType): UserModel => ({
  id: '1',
  fullName: 'Usuário Teste',
  email: 'usuario@email.com',
  role,
  active: true
});

const buildAuthServiceStub = (role: UserProfileType) => {
  const isAdmin = role === UserProfileType.ADMIN;
  return {
    currentUser$: of(buildUser(role)),
    isAdmin$: of(isAdmin),
    isAdmin: () => isAdmin,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined
  };
};

describe('LogsPageComponent', () => {
  const logs = [
    buildLog(),
    buildLog({
      id: 2,
      action: 'USER_ANONYMIZED',
      actionLabel: 'Usuário anonimizado',
      level: 'AVISO',
      details: 'Conta anonimizada',
      targetEmail: 'diego@email.com'
    })
  ];

  const configureTestingModule = async (auditLogs: AuditLogModel[]) => {
    const auditLogServiceStub = buildAuditLogServiceStub(auditLogs);
    await TestBed.configureTestingModule({
      imports: [LogsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuditLogService, useValue: auditLogServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub(UserProfileType.ADMIN) }
      ]
    }).compileComponents();
    return auditLogServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(LogsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should render the log rows with user, action, detail and level badge', async () => {
    await configureTestingModule(logs);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.page-title')?.textContent).toContain('Logs salvos');

    const rows = element.querySelectorAll('.logs-table tbody tr');
    expect(rows.length).toBe(2);
    expect(element.querySelector('.cell-user')?.textContent).toContain('admin@mapa.test');
    expect(element.querySelector('.cell-action')?.textContent).toContain('Usuário criado');
    expect(element.querySelector('.cell-detail')?.textContent).toContain(
      'Conta criada pelo administrador'
    );

    const badges = element.querySelectorAll('.level-badge');
    expect(badges[0]?.textContent).toContain('INFO');
    expect(badges[0]?.classList).toContain('level-info');
    expect(badges[1]?.textContent).toContain('AVISO');
    expect(badges[1]?.classList).toContain('level-aviso');
  });

  it('should show the empty state when no log is found', async () => {
    await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state')).not.toBeNull();
    expect(element.querySelector('.empty-state-title')?.textContent).toContain(
      'Nenhum log encontrado'
    );
    expect(element.querySelector('.logs-table')).toBeNull();
  });

  it('should request the first page filtered by level when the level select changes', async () => {
    const auditLogServiceStub = await configureTestingModule(logs);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const levelSelect = element.querySelector('.level-select') as HTMLSelectElement;
    levelSelect.value = 'AVISO';
    levelSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const lastQuery = auditLogServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.level).toBe('AVISO');
    expect(lastQuery?.page).toBe(0);
  });

  it('should keep the filters when navigating to another page', async () => {
    const auditLogServiceStub = await configureTestingModule(logs);
    const fixture = await createPageFixture();
    const component = fixture.componentInstance as LogsPageComponent;

    const levelSelect = (fixture.nativeElement as HTMLElement).querySelector(
      '.level-select'
    ) as HTMLSelectElement;
    levelSelect.value = 'INFO';
    levelSelect.dispatchEvent(new Event('change'));

    component.handlePageChange(2);
    fixture.detectChanges();

    const lastQuery = auditLogServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.level).toBe('INFO');
    expect(lastQuery?.page).toBe(2);
  });
});