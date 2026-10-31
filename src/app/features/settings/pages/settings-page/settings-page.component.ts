import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, timer } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { AccountSettings } from '../../../../core/models/account-settings.model';
import { AccountSettingsService } from '../../../../core/services/account-settings.service';
import { BaseRestorationService } from '../../../../core/services/base-restoration.service';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { AuthService } from '../../../../core/services/auth.service';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-settings-page',
  imports: [DatePipe, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule,
    MessageModule, DialogModule, HeaderNavbarComponent, LoadingComponent],
  template: `
<app-header-navbar />
<main class="settings-shell">
  <header class="page-heading">
    <span class="eyebrow">{{ isAdmin() ? 'ADMINISTRAÇÃO' : 'MINHA CONTA' }}</span>
    <h1>Configurações</h1>
    <p>{{ isAdmin() ? 'Gerencie as bases de dados padrão do MAPA.' : 'Gerencie seus dados de acesso ao MAPA.' }}</p>
  </header>

  @if (isAdmin()) {
    <aside class="policy-note">
      <i class="pi pi-database" aria-hidden="true"></i>
      <div><strong>Restauração das bases</strong>
        <p>Cada restauração apaga os dados atuais da base escolhida e carrega os dados padrão.
          A operação é registrada nos logs de auditoria.</p></div>
    </aside>
    <div class="settings-grid">
      <section class="settings-card" aria-labelledby="restore-motors-title">
        <div class="card-heading"><span class="section-number">01</span>
          <div><h2 id="restore-motors-title">Base de motores</h2><p>Recrie o catálogo com os motores padrão.</p></div>
        </div>
        <p class="restore-description">Apaga os motores atuais, os ajustes vinculados e a seleção de motor de todos os usuários.
          Desafios vinculados impedem a restauração e precisam ser removidos antes.</p>
        <p-button label="Restaurar base de motores" icon="pi pi-refresh" severity="danger"
          [disabled]="restoringBase() !== null" (onClick)="requestRestoration('motors')" />
      </section>
      <section class="settings-card" aria-labelledby="restore-maps-title">
        <div class="card-heading"><span class="section-number">02</span>
          <div><h2 id="restore-maps-title">Base de mapas</h2><p>Recrie os mapas de combustível e ignição.</p></div>
        </div>
        <p class="restore-description">Apaga os mapas de fábrica atuais e todos os ajustes personalizados dos usuários,
          substituindo a base pelos mapas padrão.</p>
        <p-button label="Restaurar base de mapas" icon="pi pi-refresh" severity="danger"
          [disabled]="restoringBase() !== null" (onClick)="requestRestoration('maps')" />
      </section>
    </div>
    @if (restorationError()) { <p-message severity="error">{{ restorationError() }}</p-message> }
    <p-dialog header="Confirmar restauração" [visible]="pendingRestoration() !== null"
      (visibleChange)="handleRestorationVisibility($event)" [modal]="true" [closable]="restoringBase() === null"
      [closeOnEscape]="restoringBase() === null" [style]="{ width: 'min(92vw, 520px)' }">
      <p class="restore-description">{{ restorationConfirmation() }}</p>
      <p class="restore-description"><strong>Essa ação não pode ser desfeita pela aplicação.</strong></p>
      @if (restoringBase()) {
        <app-loading variant="inline"
          [message]="restoringBase() === 'motors' ? 'Restaurando base de motores...' : 'Restaurando base de mapas...'" />
      }
      <div class="confirmation-actions">
        <p-button label="Cancelar" severity="secondary" [outlined]="true"
          [disabled]="restoringBase() !== null" (onClick)="cancelRestoration()" />
        <p-button label="Apagar e restaurar" severity="danger" icon="pi pi-refresh"
          [disabled]="restoringBase() !== null"
          (onClick)="confirmRestoration()" />
      </div>
    </p-dialog>
  } @else if (canManageAccount() && isLoading()) {
    <app-loading variant="page" message="Carregando suas configurações..." />
  } @else if (canManageAccount() && loadError()) {
    <p-message severity="error">{{ loadError() }}</p-message>
    <p-button label="Tentar novamente" icon="pi pi-refresh" (onClick)="loadSettings()" />
  } @else if (canManageAccount()) {
    <aside class="policy-note">
      <i class="pi pi-shield" aria-hidden="true"></i>
      <div><strong>Seus dados, com segurança.</strong>
        <p>E-mail e senha podem ser alterados uma vez por mês, cada um. Confirme sua senha atual para salvar.
          Após a alteração, você precisará entrar novamente.</p>
      </div>
    </aside>

    <div class="settings-grid">
      <section class="settings-card" aria-labelledby="email-title">
        <div class="card-heading"><span class="section-number">01</span>
          <div><h2 id="email-title">E-mail de acesso</h2><p>O endereço que você usa para entrar.</p></div>
        </div>
        <div class="current-email"><span>E-MAIL ATUAL</span><strong>{{ settings()?.email }}</strong></div>
        @if (!canChangeEmail()) {
          <p-message severity="info">Nova alteração disponível em
            {{ settings()?.nextEmailChangeAt | date:'dd/MM/yyyy HH:mm' }}.</p-message>
        }
        <form [formGroup]="emailForm" (ngSubmit)="saveEmail()">
          <fieldset [disabled]="!canChangeEmail() || savingField() !== null">
            <label for="settings-email">Novo e-mail</label>
            <input pInputText id="settings-email" type="email" formControlName="email" autocomplete="email"
              placeholder="seuemail@exemplo.com" [attr.aria-invalid]="emailForm.controls.email.touched && emailForm.controls.email.invalid"
              aria-describedby="email-hint" />
            <small id="email-hint">Informe um endereço válido com até 150 caracteres.</small>
            @if (emailForm.controls.email.touched && emailForm.controls.email.invalid) {
              <small class="field-error">Informe um e-mail válido.</small>
            }
            <label for="email-current-password">Senha atual</label>
            <p-password inputId="email-current-password" formControlName="currentPassword" autocomplete="current-password"
              [feedback]="false" [toggleMask]="true" [fluid]="true" />
            @if (emailForm.controls.currentPassword.touched && emailForm.controls.currentPassword.invalid) {
              <small class="field-error">Informe sua senha atual (até 100 caracteres).</small>
            }
          </fieldset>
          @if (emailError()) { <p-message severity="error">{{ emailError() }}</p-message> }
          @if (savingField() === 'email') {
            <app-loading variant="inline" message="Atualizando e-mail..." />
          }
          <p-button type="submit" label="Atualizar e-mail" icon="pi pi-envelope"
            [disabled]="!canChangeEmail() || savingField() !== null" />
        </form>
      </section>

      <section class="settings-card" aria-labelledby="password-title">
        <div class="card-heading"><span class="section-number">02</span>
          <div><h2 id="password-title">Senha</h2><p>Escolha uma senha exclusiva para sua conta.</p></div>
        </div>
        @if (!canChangePassword()) {
          <p-message severity="info">Nova alteração disponível em
            {{ settings()?.nextPasswordChangeAt | date:'dd/MM/yyyy HH:mm' }}.</p-message>
        }
        <form [formGroup]="passwordForm" (ngSubmit)="savePassword()">
          <fieldset [disabled]="!canChangePassword() || savingField() !== null">
            <label for="password-current">Senha atual</label>
            <p-password inputId="password-current" formControlName="currentPassword" autocomplete="current-password"
              [feedback]="false" [toggleMask]="true" [fluid]="true" />
            @if (passwordForm.controls.currentPassword.touched && passwordForm.controls.currentPassword.invalid) {
              <small class="field-error">Informe sua senha atual (até 100 caracteres).</small>
            }
            <label for="password-new">Nova senha</label>
            <p-password inputId="password-new" formControlName="newPassword" autocomplete="new-password"
              [feedback]="false" [toggleMask]="true" [fluid]="true" aria-describedby="password-hint" />
            <small id="password-hint">Use de 8 a 100 caracteres e uma senha diferente da atual.</small>
            @if (passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.invalid) {
              <small class="field-error">A nova senha deve ter de 8 a 100 caracteres.</small>
            }
            <label for="password-confirm">Confirmar nova senha</label>
            <p-password inputId="password-confirm" formControlName="confirmPassword" autocomplete="new-password"
              [feedback]="false" [toggleMask]="true" [fluid]="true" />
            @if (passwordForm.controls.confirmPassword.touched && passwordForm.controls.confirmPassword.invalid) {
              <small class="field-error">Confirme sua nova senha.</small>
            }
          </fieldset>
          @if (passwordError()) { <p-message severity="error">{{ passwordError() }}</p-message> }
          @if (savingField() === 'password') {
            <app-loading variant="inline" message="Atualizando senha..." />
          }
          <p-button type="submit" label="Atualizar senha" icon="pi pi-lock"
            [disabled]="!canChangePassword() || savingField() !== null" />
        </form>
      </section>
    </div>
    <p class="audit-note"><i class="pi pi-history" aria-hidden="true"></i>
      As alterações são registradas nos logs de auditoria. Suas senhas nunca aparecem nesses registros.</p>
  }
</main>
  `,
  styles: [`
:host { display: block; min-height: 100vh; }
.settings-shell { max-width: 1120px; margin: 0 auto; padding: 40px 24px 56px; }
.eyebrow, .section-number { font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: .1em; }
.eyebrow { color: #0072c7; font-size: .72rem; }
h1 { margin: 8px 0; font-size: 2rem; letter-spacing: -.04em; color: #0f172a; }
.page-heading p, .card-heading p { margin: 0; color: #64748b; font-size: .9rem; line-height: 1.6; }
.policy-note { display: flex; gap: 16px; margin: 28px 0; padding: 20px; border: 1px solid #bce4ff; border-radius: 12px; background: #eef8ff; color: #0b4d80; }
.policy-note > i { font-size: 1.4rem; padding-top: 2px; }
.policy-note p { margin: 6px 0 0; font-size: .85rem; line-height: 1.7; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: start; gap: 24px; }
.settings-card { padding: 28px; border: 1px solid #cbd5e1; border-radius: 12px; background: #f8fafc; box-shadow: 0 1px 3px rgb(0 0 0 / 5%); min-width: 0; }
.card-heading { display: flex; align-items: flex-start; gap: 14px; padding-bottom: 22px; margin-bottom: 22px; border-bottom: 1px solid #e2e8f0; }
.section-number { padding: 8px; background: #d9efff; color: #0072c7; border-radius: 6px; font-size: .8rem; }
h2 { margin: 0 0 4px; font-size: 1.15rem; color: #0f172a; }
.current-email { display: grid; gap: 6px; margin-bottom: 22px; overflow-wrap: anywhere; }
.current-email span { color: #64748b; font-size: .65rem; font-weight: 700; letter-spacing: .08em; }
.current-email strong { font-size: .9rem; color: #334155; }
form { display: grid; gap: 20px; }
fieldset { display: grid; gap: 10px; padding: 0; margin: 0; border: 0; min-width: 0; }
fieldset:disabled { opacity: .65; }
label { font-size: .85rem; font-weight: 700; color: #334155; margin-top: 8px; }
input { width: 100%; }
small { font-size: .75rem; color: #64748b; line-height: 1.5; }
.field-error { color: #b91c1c; }
p-message { display: block; margin-bottom: 16px; }
form p-message { margin-bottom: 0; }
.audit-note { display: flex; align-items: baseline; gap: 8px; color: #64748b; font-size: .78rem; line-height: 1.7; margin: 24px 0 0; }
.restore-description { color: #475569; font-size: .875rem; line-height: 1.7; margin: 0 0 24px; }
.confirmation-actions { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
@media (max-width: 760px) { .settings-grid { grid-template-columns: 1fr; } .settings-shell { padding: 28px 16px; } .settings-card { padding: 22px; } }
  `]
})
export class SettingsPageComponent {
  private readonly settingsService = inject(AccountSettingsService);
  private readonly restorationService = inject(BaseRestorationService);
  private readonly authService = inject(AuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly currentTime = toSignal(timer(0, 60000).pipe(map(() => Date.now())), { initialValue: Date.now() });
  private readonly currentUser = toSignal(this.authService.currentUser$);

  readonly isAdmin = computed(() => this.currentUser()?.role === UserProfileType.ADMIN);
  readonly canManageAccount = computed(() => this.currentUser()?.role === UserProfileType.STUDENT
    || this.currentUser()?.role === UserProfileType.TEACHER);
  readonly pendingRestoration = signal<'motors' | 'maps' | null>(null);
  readonly restoringBase = signal<'motors' | 'maps' | null>(null);
  readonly restorationError = signal('');
  readonly restorationConfirmation = computed(() => this.pendingRestoration() === 'motors'
    ? 'Todos os motores, ajustes vinculados e seleções serão apagados. O catálogo será recriado com os motores padrão.'
    : 'Todos os mapas de fábrica e ajustes personalizados serão apagados. A base será recriada com os mapas padrão.');

  readonly settings = signal<AccountSettings | null>(null);
  readonly isLoading = signal(true);
  readonly savingField = signal<'email' | 'password' | null>(null);
  readonly loadError = signal('');
  readonly emailError = signal('');
  readonly passwordError = signal('');
  readonly canChangeEmail = computed(() => this.isAvailable(this.settings()?.nextEmailChangeAt));
  readonly canChangePassword = computed(() => this.isAvailable(this.settings()?.nextPasswordChangeAt));

  readonly emailForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    currentPassword: ['', [Validators.required, Validators.maxLength(100)]]
  });
  readonly passwordForm = this.formBuilder.group({
    currentPassword: ['', [Validators.required, Validators.maxLength(100)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required]
  });

  constructor() {
    if (this.canManageAccount()) this.loadSettings();
  }

  requestRestoration(base: 'motors' | 'maps'): void {
    if (!this.isAdmin() || this.restoringBase()) return;
    this.restorationError.set('');
    this.pendingRestoration.set(base);
  }

  cancelRestoration(): void {
    if (!this.restoringBase()) this.pendingRestoration.set(null);
  }

  handleRestorationVisibility(visible: boolean): void {
    if (!visible) this.cancelRestoration();
  }

  confirmRestoration(): void {
    const base = this.pendingRestoration();
    if (!this.isAdmin() || !base || this.restoringBase()) return;
    this.restoringBase.set(base);
    const restorationRequest = base === 'motors'
      ? this.restorationService.restoreMotors() : this.restorationService.restoreMaps();
    restorationRequest.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.restoringBase.set(null))
    ).subscribe({
      next: (response) => {
        this.pendingRestoration.set(null);
        this.feedbackService.showSuccess('Base restaurada', response.message);
      },
      error: (httpError: HttpErrorResponse) => {
        this.pendingRestoration.set(null);
        this.restorationError.set(this.errorMessage(httpError));
      }
    });
  }

  loadSettings(): void {
    if (!this.canManageAccount()) return;
    this.isLoading.set(true);
    this.loadError.set('');
    this.settingsService.getSettings().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (settings) => this.settings.set(settings),
      error: (httpError: HttpErrorResponse) => this.loadError.set(this.errorMessage(httpError))
    });
  }

  saveEmail(): void {
    if (!this.canManageAccount() || this.savingField() || !this.canChangeEmail()) return;
    this.emailError.set('');
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;
    const request = this.emailForm.getRawValue();
    request.email = request.email.trim();
    if (request.email.toLowerCase() === this.settings()?.email.toLowerCase()) {
      this.emailError.set('Informe um e-mail diferente do atual.');
      return;
    }
    this.savingField.set('email');
    this.settingsService.changeEmail(request).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.savingField.set(null))
    ).subscribe({
      next: (response) => this.finishChange(response.message),
      error: (httpError: HttpErrorResponse) => this.emailError.set(this.errorMessage(httpError))
    });
  }

  savePassword(): void {
    if (!this.canManageAccount() || this.savingField() || !this.canChangePassword()) return;
    this.passwordError.set('');
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    const formValue = this.passwordForm.getRawValue();
    if (formValue.newPassword !== formValue.confirmPassword) {
      this.passwordError.set('A confirmação deve ser igual à nova senha.');
      return;
    }
    this.savingField.set('password');
    this.settingsService.changePassword({
      currentPassword: formValue.currentPassword, newPassword: formValue.newPassword
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.savingField.set(null))
    ).subscribe({
      next: (response) => this.finishChange(response.message),
      error: (httpError: HttpErrorResponse) => this.passwordError.set(this.errorMessage(httpError))
    });
  }

  private isAvailable(nextChangeAt: string | null | undefined): boolean {
    return this.settings() !== null && (!nextChangeAt || new Date(nextChangeAt).getTime() <= this.currentTime());
  }

  private errorMessage(httpError: HttpErrorResponse): string {
    if (httpError.status === 0) return 'Não foi possível conectar à API. Tente novamente.';
    return (httpError.error as { message?: string } | null)?.message ?? 'Não foi possível salvar. Tente novamente.';
  }

  private finishChange(message: string): void {
    this.emailForm.reset();
    this.passwordForm.reset();
    this.authService.logout();
    this.feedbackService.showSuccess('Dados atualizados', message, { life: 7000 });
    void this.router.navigate(['/login']);
  }
}
