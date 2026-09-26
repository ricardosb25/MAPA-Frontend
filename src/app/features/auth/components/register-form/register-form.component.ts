import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterCredentials } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { TermsOfUseModalComponent } from '../terms-of-use-modal/terms-of-use-modal.component';

export const passwordMatchValidator: ValidatorFn = (controlGroup: AbstractControl): ValidationErrors | null => {
  const passwordControl = controlGroup.get('password');
  const confirmPasswordControl = controlGroup.get('confirmPassword');

  if (!passwordControl || !confirmPasswordControl) {
    return null;
  }

  if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
    return null;
  }

  if (passwordControl.value !== confirmPasswordControl.value) {
    confirmPasswordControl.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    confirmPasswordControl.setErrors(null);
    return null;
  }
};

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TermsOfUseModalComponent],
  template: `
    <div class="form-card-container">
      <h2 class="form-title">Criar conta</h2>
      <p class="form-subtitle">Comece hoje mesmo a transformar suas ideias em realidade.</p>

      <form [formGroup]="registerForm" (ngSubmit)="handleFormSubmit()" class="auth-form">
        <div class="field-group">
          <label for="fullNameInput" class="field-label">Nome completo</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('fullName')">
            <i class="pi pi-user input-prefix-icon"></i>
            <input
              id="fullNameInput"
              type="text"
              formControlName="fullName"
              placeholder="Nome"
              class="form-input"
            />
          </div>
          @if (isFieldInvalid('fullName')) {
            <span class="error-message">Informe o seu nome completo.</span>
          }
        </div>

        <div class="field-group">
          <label for="registerEmailInput" class="field-label">E-mail</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('email')">
            <i class="pi pi-envelope input-prefix-icon"></i>
            <input
              id="registerEmailInput"
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
          <label for="registerPasswordInput" class="field-label">Senha</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('password')">
            <i class="pi pi-lock input-prefix-icon"></i>
            <input
              id="registerPasswordInput"
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

        <div class="field-group">
          <label for="confirmPasswordInput" class="field-label">Confirmar senha</label>
          <div class="input-wrapper" [class.input-error]="isFieldInvalid('confirmPassword')">
            <i class="pi pi-lock input-prefix-icon"></i>
            <input
              id="confirmPasswordInput"
              [type]="isConfirmPasswordVisible ? 'text' : 'password'"
              formControlName="confirmPassword"
              placeholder="Repita a senha cadastrada"
              class="form-input"
            />
            <button
              type="button"
              (click)="toggleConfirmPasswordVisibility()"
              class="icon-toggle-button"
              aria-label="Alternar visibilidade da confirmação de senha"
            >
              <i [class]="isConfirmPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          @if (isFieldInvalid('confirmPassword')) {
            <span class="error-message">As senhas não coincidem.</span>
          }
        </div>

        <div class="field-group">
          <label for="profileTypeSelect" class="field-label">Selecionar perfil</label>
          <div class="input-wrapper select-wrapper" [class.input-error]="isFieldInvalid('profileType')">
            <i class="pi pi-user input-prefix-icon"></i>
            <select id="profileTypeSelect" formControlName="profileType" class="form-input custom-select">
              <option value="" disabled selected hidden>Professor ou aluno</option>
              <option [value]="profileTypes.TEACHER">Professor</option>
              <option [value]="profileTypes.STUDENT">Aluno</option>
            </select>
            <i class="pi pi-chevron-down input-suffix-icon"></i>
          </div>
          @if (isFieldInvalid('profileType')) {
            <span class="error-message">Selecione um tipo de perfil.</span>
          }
        </div>

        <div class="terms-consent-group">
          <div class="terms-consent-row">
            <input
              id="acceptedTermsInput"
              type="checkbox"
              formControlName="acceptedTerms"
              class="terms-checkbox"
            />
            <label for="acceptedTermsInput" class="terms-consent-label">Li e concordo com os</label>
            <button type="button" class="terms-link" (click)="openTermsModal()">
              Termos de Uso e Política de Privacidade
            </button>
            <span class="terms-consent-label">do MAPA.</span>
          </div>
          @if (isFieldInvalid('acceptedTerms')) {
            <span class="error-message">É necessário aceitar os Termos de Uso para se cadastrar.</span>
          }
        </div>

        <button type="submit" [disabled]="isSubmitting" class="submit-button">
          @if (isSubmitting) {
            <i class="pi pi-spin pi-spinner button-spinner"></i>
            <span>Cadastrando...</span>
          } @else {
            <span>Cadastrar</span>
          }
        </button>

        <p class="switch-route-text">
          Já tenho uma conta. <a routerLink="/login" class="route-link">Entrar</a>
        </p>
      </form>

      @if (isTermsModalOpen) {
        <app-terms-of-use-modal (close)="closeTermsModal()"></app-terms-of-use-modal>
      }
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
      margin: 0 0 1.75rem 0;
      line-height: 1.4;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
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
      height: 50px;
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

    .input-suffix-icon {
      color: #64748b;
      font-size: 0.9rem;
      pointer-events: none;
      margin-left: 0.5rem;
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

    .custom-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
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

    .terms-consent-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.25rem;
    }

    .terms-consent-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .terms-checkbox {
      width: 16px;
      height: 16px;
      accent-color: #0099ff;
      cursor: pointer;
      flex-shrink: 0;
    }

    .terms-consent-label {
      font-size: 0.85rem;
      color: #334155;
      cursor: pointer;
    }

    .terms-link {
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0099ff;
      text-decoration: underline;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .terms-link:hover {
      color: #0088e6;
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
export class RegisterFormComponent {
  @Input() isSubmitting = false;
  @Output() submitRegisterForm = new EventEmitter<RegisterCredentials>();

  registerForm: FormGroup;
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isTermsModalOpen = false;
  readonly profileTypes = UserProfileType;

  constructor(private readonly formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        profileType: ['', [Validators.required]],
        acceptedTerms: [false, [Validators.requiredTrue]]
      },
      { validators: passwordMatchValidator }
    );
  }

  openTermsModal(): void {
    this.isTermsModalOpen = true;
  }

  closeTermsModal(): void {
    this.isTermsModalOpen = false;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  isFieldInvalid(fieldName: string): boolean {
    const fieldControl = this.registerForm.get(fieldName);
    return !!(fieldControl && fieldControl.invalid && (fieldControl.dirty || fieldControl.touched));
  }

  handleFormSubmit(): void {
    if (this.registerForm.valid) {
      this.submitRegisterForm.emit(this.registerForm.value as RegisterCredentials);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
