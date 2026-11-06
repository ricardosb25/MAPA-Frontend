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