import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForgotPasswordRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-card-container">
      <h2 class="form-title">Recuperar senha</h2>
      <p class="form-subtitle">
        Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
      </p>

      <form [formGroup]="forgotPasswordForm" (ngSubmit)="handleFormSubmit()" class="auth-form">
        <div class="field-group">
          <label for="forgotEmailInput" class="field-label">E-mail</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('email')">
            <i class="pi pi-envelope input-prefix-icon"></i>
            <input
              id="forgotEmailInput"
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

        <button type="submit" [disabled]="isSubmitting" class="submit-button">
          @if (isSubmitting) {
            <i class="pi pi-spin pi-spinner button-spinner"></i>
            <span>Enviando...</span>
          } @else {
            <span>Enviar link</span>
          }
        </button>

        <p class="switch-route-text">
          Lembrou a senha? <a routerLink="/login" class="route-link">Voltar ao login</a>
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
export class ForgotPasswordFormComponent {
  @Input() isSubmitting = false;
  @Output() submitForgotPasswordForm = new EventEmitter<ForgotPasswordRequest>();

  forgotPasswordForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const fieldControl = this.forgotPasswordForm.get(fieldName);
    return !!(fieldControl && fieldControl.invalid && (fieldControl.dirty || fieldControl.touched));
  }

  handleFormSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.submitForgotPasswordForm.emit(this.forgotPasswordForm.value as ForgotPasswordRequest);
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}