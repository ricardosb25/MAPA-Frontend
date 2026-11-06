import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginCredentials } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-card-container">
      <h2 class="form-title">Realizar login</h2>
      <p class="form-subtitle">Comece hoje mesmo a transformar suas ideias em realidade.</p>

      <form [formGroup]="loginForm" (ngSubmit)="handleFormSubmit()" class="auth-form">
        <div class="field-group">
          <label for="emailInput" class="field-label">E-mail</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('email')">
            <i class="pi pi-envelope input-prefix-icon"></i>
            <input
              id="emailInput"
              type="email"
              formControlName="email"
              placeholder="exemplo@email.com"
              class="form-input"
            />
          </div>
          @if (isFieldInvalid('email')) {
            <span class="error-message">Informe um e-mail válido.</span>
          }
        </div>

        <div class="field-group">
          <label for="passwordInput" class="field-label">Senha</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('password')">
            <i class="pi pi-lock input-prefix-icon"></i>
            <input
              id="passwordInput"
              [type]="isPasswordVisible ? 'text' : 'password'"
              formControlName="password"
              placeholder="Mínimo 8 caracteres"
              class="form-input"
            />
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="icon-toggle-button"
              aria-label="Alternar visibilidade da senha"
            >
              <i [class]="isPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          @if (isFieldInvalid('password')) {
            <span class="error-message">A senha deve ter no mínimo 8 caracteres.</span>
          }
        </div>

        <div class="forgot-password-row">
          <a routerLink="/forgot-password" class="route-link forgot-password-link">Esqueceu a senha?</a>
        </div>

        <button type="submit" [disabled]="isSubmitting" class="submit-button">
          @if (isSubmitting) {
            <i class="pi pi-spin pi-spinner button-spinner"></i>
            <span>Entrando...</span>
          } @else {
            <span>Entrar</span>
          }
        </button>

        <p class="switch-route-text">
          Não tem uma conta? <a routerLink="/register" class="route-link">Cadastre-Se</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .form-subtitle {
      font-size: 0.925rem;
      color: var(--mapa-gray-500);
      margin: 0 0 2rem 0;
      line-height: 1.4;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .icon-toggle-button {
      background: none;
      border: none;
      color: var(--mapa-gray-500);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: color 0.2s ease;
    }

    .icon-toggle-button:hover {
      color: var(--mapa-ink);
    }

    .forgot-password-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -0.75rem;
    }

    .forgot-password-link {
      font-size: 0.85rem;
    }
  `]
})
export class LoginFormComponent {
  @Input() isSubmitting = false;
  @Output() submitLoginForm = new EventEmitter<LoginCredentials>();

  loginForm: FormGroup;
  isPasswordVisible = false;

  constructor(private readonly formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  isFieldInvalid(fieldName: string): boolean {
    const fieldControl = this.loginForm.get(fieldName);
    return !!(fieldControl && fieldControl.invalid && (fieldControl.dirty || fieldControl.touched));
  }

  handleFormSubmit(): void {
    if (this.loginForm.valid) {
      this.submitLoginForm.emit(this.loginForm.value as LoginCredentials);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
