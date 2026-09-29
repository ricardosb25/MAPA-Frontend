import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { AdminUserService } from './core/services/admin-user.service';
import { AuditLogService } from './core/services/audit-log.service';
import { AuthService } from './core/services/auth.service';
import { EngineService } from './core/services/engine.service';
import { HttpAdminUserService } from './core/services/http-admin-user.service';
import { HttpAuditLogService } from './core/services/http-audit-log.service';
import { HttpAuthService } from './core/services/http-auth.service';
import { HttpEngineService } from './core/services/http-engine.service';

describe('appConfig', () => {
  const configureRootTestBed = async () => {
    await TestBed.configureTestingModule({ providers: appConfig.providers }).compileComponents();
  };

  it('should resolve every abstract service to its HTTP implementation', async () => {
    await configureRootTestBed();

    expect(TestBed.inject(AuthService)).toBeInstanceOf(HttpAuthService);
    expect(TestBed.inject(EngineService)).toBeInstanceOf(HttpEngineService);
    expect(TestBed.inject(AuditLogService)).toBeInstanceOf(HttpAuditLogService);
    expect(TestBed.inject(AdminUserService)).toBeInstanceOf(HttpAdminUserService);
  });
});
