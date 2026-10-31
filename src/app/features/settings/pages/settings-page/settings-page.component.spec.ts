import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPageComponent } from './settings-page.component';
import { AccountSettingsService } from '../../../../core/services/account-settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FeedbackService } from '../../../../shared/services/feedback.service';

describe('SettingsPageComponent', () => {
  const settingsService = {
    getSettings: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn()
  };
  const authService = { logout: vi.fn(), currentUser$: of(null), isAdmin$: of(false) };
  const feedbackService = { showSuccess: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    settingsService.getSettings.mockReturnValue(of({
      email: 'ana@mapa.test', nextEmailChangeAt: null, nextPasswordChangeAt: null
    }));
    TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [provideRouter([]),
        { provide: AccountSettingsService, useValue: settingsService },
        { provide: AuthService, useValue: authService },
        { provide: FeedbackService, useValue: feedbackService }]
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('blocks changes independently until the next available date', () => {
    settingsService.getSettings.mockReturnValue(of({ email: 'ana@mapa.test',
      nextEmailChangeAt: '2099-01-01T00:00:00Z', nextPasswordChangeAt: null }));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    expect(component.canChangeEmail()).toBe(false);
    expect(component.canChangePassword()).toBe(true);
    component.saveEmail();
    expect(settingsService.changeEmail).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('rejects mismatched password confirmation before sending credentials', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.passwordForm.setValue({ currentPassword: 'current-password',
      newPassword: 'new-password', confirmPassword: 'different-password' });
    component.savePassword();
    expect(component.passwordError()).toContain('confirmação');
    expect(settingsService.changePassword).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('ends the local session after changing email', () => {
    settingsService.changeEmail.mockReturnValue(of({ message: 'Entre novamente.' }));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.emailForm.setValue({ email: 'new@mapa.test', currentPassword: 'current-password' });
    component.saveEmail();
    expect(settingsService.changeEmail).toHaveBeenCalledWith({ email: 'new@mapa.test', currentPassword: 'current-password' });
    expect(authService.logout).toHaveBeenCalledOnce();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login']);
    expect(component.emailForm.controls.currentPassword.value).toBe('');
    fixture.destroy();
  });

  it('keeps the session and displays API validation errors', () => {
    settingsService.changePassword.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400, error: { message: 'A senha atual está incorreta.' }
    })));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.passwordForm.setValue({ currentPassword: 'wrong-password',
      newPassword: 'new-password', confirmPassword: 'new-password' });
    component.savePassword();
    expect(component.passwordError()).toBe('A senha atual está incorreta.');
    expect(component.savingField()).toBeNull();
    expect(authService.logout).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('exposes a retryable loading error', () => {
    settingsService.getSettings.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    expect(component.isLoading()).toBe(false);
    expect(component.loadError()).toContain('conectar');
    component.loadSettings();
    expect(component.loadError()).toBe('');
    expect(component.settings()?.email).toBe('ana@mapa.test');
    fixture.destroy();
  });
});
