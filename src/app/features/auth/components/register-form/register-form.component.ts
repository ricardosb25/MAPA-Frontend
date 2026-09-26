import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
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
          <div
            class="custom-dropdown-container"
            [class.dropdown-open]="isProfileDropdownOpen"
          >
            <button
              id="profileTypeSelect"
              type="button"
              class="input-wrapper custom-dropdown-trigger"
              [class.input-error]="isFieldInvalid('profileType')"
              (click)="toggleProfileDropdown()"
              aria-haspopup="listbox"
              [attr.aria-expanded]="isProfileDropdownOpen"
            >
              <i class="pi pi-id-card input-prefix-icon"></i>
              <span
                class="dropdown-selected-text"
                [class.placeholder]="!registerForm.get('profileType')?.value"
              >
                {{ selectedProfileLabel || 'Professor ou aluno' }}
              </span>
              <i
                class="pi pi-chevron-down dropdown-arrow"
                [class.arrow-rotated]="isProfileDropdownOpen"
              ></i>
            </button>

            @if (isProfileDropdownOpen) {
              <ul class="custom-dropdown-menu" role="listbox" aria-label="Tipos de perfil">
                <li
                  class="custom-dropdown-option"
                  role="option"
                  [attr.aria-selected]="registerForm.get('profileType')?.value === profileTypes.TEACHER"
                  [class.option-selected]="registerForm.get('profileType')?.value === profileTypes.TEACHER"
                  (click)="selectProfileType(profileTypes.TEACHER)"
                >
                  <i class="pi pi-briefcase option-icon"></i>
                  <span class="option-label">Professor</span>
                  @if (registerForm.get('profileType')?.value === profileTypes.TEACHER) {
                    <i class="pi pi-check option-check-icon"></i>
                  }
                </li>
                <li
                  class="custom-dropdown-option"
                  role="option"
                  [attr.aria-selected]="registerForm.get('profileType')?.value === profileTypes.STUDENT"
                  [class.option-selected]="registerForm.get('profileType')?.value === profileTypes.STUDENT"
                  (click)="selectProfileType(profileTypes.STUDENT)"
                >
                  <i class="pi pi-user option-icon"></i>
                  <span class="option-label">Aluno</span>
                  @if (registerForm.get('profileType')?.value === profileTypes.STUDENT) {
                    <i class="pi pi-check option-check-icon"></i>
                  }
                </li>
              </ul>
            }
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

    .custom-dropdown-container {
      position: relative;
      width: 100%;
    }

    .custom-dropdown-trigger {
      width: 100%;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      border: 1px solid #cbd5e1;
      background-color: #f1f5f9;
    }

    .custom-dropdown-trigger:focus,
    .custom-dropdown-container.dropdown-open .custom-dropdown-trigger {
      outline: none;
      border-color: #0099ff;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .custom-dropdown-trigger.input-error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .dropdown-selected-text {
      flex: 1;
      font-size: 0.95rem;
      color: #0f172a;
      user-select: none;
    }

    .dropdown-selected-text.placeholder {
      color: #94a3b8;
    }

    .dropdown-arrow {
      color: #64748b;
      font-size: 0.85rem;
      transition: transform 0.2s ease, color 0.2s ease;
      margin-left: auto;
    }

    .dropdown-arrow.arrow-rotated {
      transform: rotate(180deg);
      color: #0099ff;
    }

    .custom-dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 50;
      margin: 0;
      padding: 6px;
      list-style: none;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      animation: dropdownSlideDown 0.15s ease-out;
    }

    @keyframes dropdownSlideDown {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .custom-dropdown-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.925rem;
      color: #0f172a;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .custom-dropdown-option:hover {
      background-color: #f1f5f9;
      color: #0099ff;
    }

    .custom-dropdown-option.option-selected {
      background-color: #eef8ff;
      color: #0099ff;
      font-weight: 600;
    }

    .option-icon {
      font-size: 1rem;
      color: #64748b;
    }

    .custom-dropdown-option:hover .option-icon,
    .custom-dropdown-option.option-selected .option-icon {
      color: #0099ff;
    }

    .option-label {
      flex: 1;
    }

    .option-check-icon {
      font-size: 0.9rem;
      color: #0099ff;
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
      gap: 0.5rem;
    }

    .terms-checkbox {
      width: 18px;
      height: 18px;
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
  isProfileDropdownOpen = false;
  readonly profileTypes = UserProfileType;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly elementRef: ElementRef
  ) {
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

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(targetElement)) {
      this.isProfileDropdownOpen = false;
    }
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (!this.isProfileDropdownOpen) {
      this.registerForm.get('profileType')?.markAsTouched();
    }
  }

  selectProfileType(type: UserProfileType): void {
    this.registerForm.get('profileType')?.setValue(type);
    this.registerForm.get('profileType')?.markAsDirty();
    this.registerForm.get('profileType')?.markAsTouched();
    this.isProfileDropdownOpen = false;
  }

  get selectedProfileLabel(): string {
    const selectedProfile = this.registerForm.get('profileType')?.value;
    if (selectedProfile === UserProfileType.TEACHER) {
      return 'Professor';
    }
    if (selectedProfile === UserProfileType.STUDENT) {
      return 'Aluno';
    }
    return '';
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
