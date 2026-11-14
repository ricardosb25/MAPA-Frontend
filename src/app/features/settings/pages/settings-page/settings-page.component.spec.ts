import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPageComponent } from './settings-page.component';
import { AccountSettingsService } from '../../../../core/services/account-settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { BaseRestorationService } from '../../../../core/services/base-restoration.service';
import { UserModel } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';

describe('SettingsPageComponent', () => {
  const settingsService = {
    getSettings: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn()
  };
  const currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  const authService = { logout: vi.fn(), currentUser$: currentUserSubject, isAdmin$: of(false) };
  const restorationService = {
    restoreMotors: vi.fn(), restoreMaps: vi.fn(), getPresentationMode: vi.fn(), setPresentationMode: vi.fn()
  };
  const feedbackService = { showSuccess: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    restorationService.getPresentationMode.mockReturnValue(of({ enabled: false, teacherName: null }));
    currentUserSubject.next({ id: '7', fullName: 'Ana Silva', email: 'ana@mapa.test',
      role: UserProfileType.STUDENT, active: true });
    settingsService.getSettings.mockReturnValue(of({
      email: 'ana@mapa.test', nextEmailChangeAt: null, nextPasswordChangeAt: null
    }));
    TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [provideRouter([]),
        { provide: AccountSettingsService, useValue: settingsService },
        { provide: AuthService, useValue: authService },
        { provide: BaseRestorationService, useValue: restorationService },
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

  it('shows restoration actions instead of personal settings for admins', async () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.ADMIN });
    const fixture = TestBed.createComponent(SettingsPageComponent);
    await fixture.whenStable();
    const pageContent = (fixture.nativeElement as HTMLElement).textContent;
    expect(pageContent).toContain('Restaurar base de motores');
    expect(pageContent).toContain('Restaurar base de mapas');
    expect(pageContent).toContain('Modo apresentação');
    expect(pageContent).not.toContain('E-mail de acesso');
    expect(settingsService.getSettings).not.toHaveBeenCalled();
    fixture.componentInstance.saveEmail();
    fixture.componentInstance.savePassword();
    expect(settingsService.changeEmail).not.toHaveBeenCalled();
    expect(settingsService.changePassword).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('keeps personal settings available for teachers and hides restoration', async () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.TEACHER });
    const fixture = TestBed.createComponent(SettingsPageComponent);
    await fixture.whenStable();
    const pageContent = (fixture.nativeElement as HTMLElement).textContent;
    expect(pageContent).toContain('E-mail de acesso');
    expect(pageContent).not.toContain('Restaurar base de motores');
    expect(pageContent).not.toContain('Modo apresentação');
    expect(restorationService.getPresentationMode).not.toHaveBeenCalled();
    fixture.componentInstance.requestRestoration('maps');
    fixture.componentInstance.confirmRestoration();
    expect(restorationService.restoreMaps).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('requires a checked confirmation when enabling and disabling presentation mode', async () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.ADMIN });
    restorationService.setPresentationMode
      .mockReturnValueOnce(of({ enabled: true, teacherName: 'Professor Demo' }))
      .mockReturnValueOnce(of({ enabled: false, teacherName: null }));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    for (const nextState of [true, false]) {
      const toggle = page.querySelector<HTMLInputElement>('#presentation-mode')!;
      expect(toggle.checked).toBe(!nextState);
      toggle.click();
      await fixture.whenStable();
      expect(toggle.checked).toBe(!nextState);
      const confirmation = document.querySelector<HTMLInputElement>('app-confirm-dialog input[type="checkbox"], p-dialog input[type="checkbox"], [role="dialog"] input[type="checkbox"]')!;
      const confirmButton = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
        .find((button) => button.textContent?.includes(nextState ? 'Ativar modo apresentação' : 'Desativar modo apresentação'))!;
      expect(confirmButton.disabled).toBe(true);
      confirmation.click();
      await fixture.whenStable();
      confirmButton.click();
      await fixture.whenStable();
      expect(restorationService.setPresentationMode).toHaveBeenLastCalledWith(nextState);
      expect(toggle.checked).toBe(nextState);
    }
  });

  it('requires confirmation and prevents duplicate restoration requests', () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.ADMIN });
    const restorationResponse = new Subject<{ message: string }>();
    restorationService.restoreMotors.mockReturnValue(restorationResponse);
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.requestRestoration('motors');
    expect(component.restorationConfirmation()).toContain('desafios vinculados, participações, progressos, tentativas');
    expect(component.restorationConfirmation()).toContain('histórico do dinamômetro');
    expect(restorationService.restoreMotors).not.toHaveBeenCalled();
    component.confirmRestoration();
    component.confirmRestoration();
    component.cancelRestoration();
    expect(component.pendingRestoration()).toBe('motors');
    expect(restorationService.restoreMotors).toHaveBeenCalledOnce();
    restorationResponse.next({ message: 'Restaurado.' });
    restorationResponse.complete();
    expect(component.pendingRestoration()).toBeNull();
    expect(component.restoringBase()).toBeNull();
    expect(feedbackService.showSuccess).toHaveBeenCalledWith('Base restaurada', 'Restaurado.');
    fixture.destroy();
  });

  it('cancels restoration without contacting the API', () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.ADMIN });
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.requestRestoration('maps');
    component.cancelRestoration();
    component.confirmRestoration();
    expect(restorationService.restoreMaps).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('shows a restoration failure and allows trying again', () => {
    currentUserSubject.next({ ...currentUserSubject.value!, role: UserProfileType.ADMIN });
    restorationService.restoreMaps.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { message: 'Restauração indisponível.' }
    })));
    const fixture = TestBed.createComponent(SettingsPageComponent);
    const component = fixture.componentInstance;
    component.requestRestoration('maps');
    component.confirmRestoration();
    expect(component.restorationError()).toBe('Restauração indisponível.');
    expect(component.restoringBase()).toBeNull();
    expect(component.pendingRestoration()).toBeNull();
    fixture.destroy();
  });
});
