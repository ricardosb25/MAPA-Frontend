import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let router: Router;

  const buildAuthServiceStub = (isAuthenticated: boolean, isAdmin: boolean) => ({
    isAuthenticated: () => isAuthenticated,
    isAdmin: () => isAdmin,
    logout: () => undefined
  });

  const configureTestingModule = (isAuthenticated: boolean, isAdmin: boolean) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: buildAuthServiceStub(isAuthenticated, isAdmin) }
      ]
    });
    router = TestBed.inject(Router);
  };

  const runGuard = (): ReturnType<CanActivateFn> =>
    TestBed.runInInjectionContext(() => adminGuard(null as never, null as never));

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should redirect unauthenticated users to the login page', () => {
    configureTestingModule(false, false);

    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });

  it('should redirect authenticated non-admin users to the garage page', () => {
    configureTestingModule(true, false);

    expect(runGuard()).toEqual(router.createUrlTree(['/garage']));
  });

  it('should allow admin users to access the protected route', () => {
    configureTestingModule(true, true);

    expect(runGuard()).toBe(true);
  });
});