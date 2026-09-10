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
    .form-card-container {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
    }

    .form-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0 0 0.5rem 0;
    }

    .form-subtitle {
      font-size: 0.925rem;
      color: #64748b;
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

    .field-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 0 0.875rem;
      height: 52px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: #0099ff;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .input-wrapper.input-error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .input-prefix-icon {
      color: #64748b;
      font-size: 1.1rem;
      margin-right: 0.75rem;
    }

    .form-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.95rem;
      color: #0f172a;
      width: 100%;
    }

    .form-input::placeholder {
      color: #94a3b8;
    }

    .icon-toggle-button {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: color 0.2s ease;
    }

    .icon-toggle-button:hover {
      color: #0f172a;
    }

    .error-message {
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 0.15rem;
    }

    .submit-button {
      height: 52px;
      background-color: #0099ff;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      transition: background-color 0.2s ease, transform 0.1s ease;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #0088e6;
    }

    .submit-button:active:not(:disabled) {
      transform: scale(0.99);
    }

    .submit-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .button-spinner {
      font-size: 1.1rem;
    }

    .switch-route-text {
      text-align: left;
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.5rem;
    }

    .route-link {
      color: #0099ff;
      font-weight: 600;
      text-decoration: none;
      transition: text-decoration 0.2s ease;
    }

    .route-link:hover {
      text-decoration: underline;
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
