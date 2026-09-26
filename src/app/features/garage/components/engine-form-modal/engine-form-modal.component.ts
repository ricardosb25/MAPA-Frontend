import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  EngineAspirationType,
  EngineModel,
  EnginePayload
} from '../../../../core/models/engine.model';

export function decimalPlacesValidator(
  integerDigits: number,
  fractionDigits: number
): ValidatorFn {
  const decimalPattern = new RegExp(`^\\d{1,${integerDigits}}(\\.\\d{1,${fractionDigits}})?$`);

  return (formControl: AbstractControl): ValidationErrors | null => {
    const controlValue = formControl.value;

    if (controlValue === null || controlValue === undefined || controlValue === '') {
      return null;
    }

    return decimalPattern.test(String(controlValue)) ? null : { decimalPlacesInvalid: true };
  };
}

export const integerValueValidator: ValidatorFn = (
  formControl: AbstractControl
): ValidationErrors | null => {
  const controlValue = formControl.value;

  if (controlValue === null || controlValue === undefined || controlValue === '') {
    return null;
  }

  return Number.isInteger(Number(controlValue)) ? null : { integerValueInvalid: true };
};

@Component({
  selector: 'app-engine-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    '(document:keydown.escape)': 'handleClose()'
  },
  template: `
    <div class="modal-backdrop" (click)="handleBackdropClick($event)">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="engineFormModalTitle">
        <header class="modal-header">
          <div class="modal-header-text">
            <span class="modal-tag">{{ isEditMode ? 'EDIÇÃO' : 'CADASTRO' }}</span>
            <h2 class="modal-title" id="engineFormModalTitle">{{ modalTitle }}</h2>
          </div>
          <button
            type="button"
            class="modal-close-button"
            [disabled]="isSubmitting"
            (click)="handleClose()"
            aria-label="Fechar"
          >
            <i class="pi pi-times"></i>
          </button>
        </header>

        <form [formGroup]="engineForm" (ngSubmit)="handleFormSubmit()" class="engine-form" novalidate>
          <div class="form-body">
            @if (errorMessage) {
              <div class="server-error-banner">
                <i class="pi pi-exclamation-triangle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <div class="form-grid">
              <div class="field-group">
                <label for="engineManufacturerInput" class="field-label">Fabricante *</label>
                <input
                  id="engineManufacturerInput"
                  type="text"
                  formControlName="manufacturer"
                  maxlength="50"
                  placeholder="Ex.: Honda"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('manufacturer')"
                />
                @if (isFieldInvalid('manufacturer')) {
                  <span class="error-message">Informe o fabricante (máx. 50 caracteres).</span>
                }
                @if (getServerFieldError('manufacturer'); as manufacturerServerError) {
                  <span class="error-message">{{ manufacturerServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineNameInput" class="field-label">Nome *</label>
                <input
                  id="engineNameInput"
                  type="text"
                  formControlName="name"
                  maxlength="50"
                  placeholder="Ex.: CG 160 Titan"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('name')"
                />
                @if (isFieldInvalid('name')) {
                  <span class="error-message">Informe o nome do motor (máx. 50 caracteres).</span>
                }
                @if (getServerFieldError('name'); as nameServerError) {
                  <span class="error-message">{{ nameServerError }}</span>
                }
              </div>

              <div class="field-group field-group-full">
                <label for="engineDescriptionInput" class="field-label">Descrição</label>
                <textarea
                  id="engineDescriptionInput"
                  formControlName="description"
                  maxlength="255"
                  rows="3"
                  placeholder="Aplicação didática, particularidades do motor..."
                  class="form-input form-textarea"
                  [class.input-error]="isFieldInvalid('description')"
                ></textarea>
                @if (isFieldInvalid('description')) {
                  <span class="error-message">A descrição deve ter no máximo 255 caracteres.</span>
                }
                @if (getServerFieldError('description'); as descriptionServerError) {
                  <span class="error-message">{{ descriptionServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineDisplacementLitersInput" class="field-label">Cilindrada (L) *</label>
                <input
                  id="engineDisplacementLitersInput"
                  type="number"
                  formControlName="displacementLiters"
                  step="0.1"
                  min="0"
                  placeholder="Ex.: 1.8"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('displacementLiters')"
                />
                @if (isFieldInvalid('displacementLiters')) {
                  <span class="error-message">Informe a cilindrada (ex.: 1.8, até 1 casa decimal).</span>
                }
                @if (getServerFieldError('displacementLiters'); as litersServerError) {
                  <span class="error-message">{{ litersServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineDisplacementCcInput" class="field-label">Cilindrada (cm³) *</label>
                <input
                  id="engineDisplacementCcInput"
                  type="number"
                  formControlName="displacementCc"
                  step="1"
                  min="1"
                  placeholder="Ex.: 1781"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('displacementCc')"
                />
                @if (isFieldInvalid('displacementCc')) {
                  <span class="error-message">Informe um número inteiro maior que zero.</span>
                }
                @if (getServerFieldError('displacementCc'); as ccServerError) {
                  <span class="error-message">{{ ccServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineCompressionRatioInput" class="field-label">Taxa de compressão *</label>
                <input
                  id="engineCompressionRatioInput"
                  type="number"
                  formControlName="compressionRatio"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex.: 9.5"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('compressionRatio')"
                />
                @if (isFieldInvalid('compressionRatio')) {
                  <span class="error-message">Informe um valor maior que zero (ex.: 9.5).</span>
                }
                @if (getServerFieldError('compressionRatio'); as compressionServerError) {
                  <span class="error-message">{{ compressionServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineRpmCutoffInput" class="field-label">Corte de giro (rpm) *</label>
                <input
                  id="engineRpmCutoffInput"
                  type="number"
                  formControlName="rpmCutoff"
                  step="1"
                  min="1"
                  placeholder="Ex.: 6500"
                  class="form-input"
                  [class.input-error]="isFieldInvalid('rpmCutoff')"
                />
                @if (isFieldInvalid('rpmCutoff')) {
                  <span class="error-message">Informe um número inteiro de rpm maior que zero.</span>
                }
                @if (getServerFieldError('rpmCutoff'); as rpmServerError) {
                  <span class="error-message">{{ rpmServerError }}</span>
                }
              </div>

              <div class="field-group">
                <label for="engineAspirationTypeSelect" class="field-label">Aspiração *</label>
                <select
                  id="engineAspirationTypeSelect"
                  formControlName="aspirationType"
                  class="form-input form-select"
                  [class.input-error]="isFieldInvalid('aspirationType')"
                >
                  <option *ngFor="let aspirationOption of aspirationOptions" [value]="aspirationOption">
                    {{ aspirationLabels[aspirationOption] }}
                  </option>
                </select>
                @if (isFieldInvalid('aspirationType')) {
                  <span class="error-message">Selecione o tipo de aspiração.</span>
                }
                @if (getServerFieldError('aspirationType'); as aspirationServerError) {
                  <span class="error-message">{{ aspirationServerError }}</span>
                }
              </div>
            </div>

            <div
              class="confirmation-group"
              [class.confirmation-error]="isFieldInvalid('confirmation')"
            >
              <input
                type="checkbox"
                id="engineConfirmationCheckbox"
                class="confirmation-checkbox"
                formControlName="confirmation"
              />
              <label for="engineConfirmationCheckbox" class="confirmation-label">
                {{ confirmationLabel }}
              </label>
            </div>
            @if (isFieldInvalid('confirmation')) {
              <span class="error-message">É necessário marcar a confirmação para salvar.</span>
            }
          </div>

          <footer class="modal-footer">
            <button
              type="button"
              class="secondary-button"
              [disabled]="isSubmitting"
              (click)="handleClose()"
            >
              Cancelar
            </button>
            <button type="submit" class="primary-button" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <i class="pi pi-spin pi-spinner"></i>
                <span>Salvando...</span>
              } @else {
                <i class="fa-solid fa-floppy-disk"></i>
                <span>{{ submitButtonLabel }}</span>
              }
            </button>
          </footer>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }

    .modal-card {
      width: 100%;
      max-width: 680px;
      background-color: #ffffff;
      border-radius: 14px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: auto;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px 12px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-tag {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #0284c7;
    }

    .modal-title {
      margin: 4px 0 0 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .modal-close-button {
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }

    .modal-close-button:hover:not(:disabled) {
      color: #0f172a;
      background-color: #f1f5f9;
    }

    .form-body {
      padding: 20px 24px 0 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group-full {
      grid-column: 1 / -1;
    }

    .field-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #475569;
      text-transform: uppercase;
    }

    .form-input {
      width: 100%;
      height: 42px;
      padding: 0 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background-color: #f8fafc;
      font-family: inherit;
      font-size: 0.9rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-input:focus {
      border-color: #0099ff;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .form-input.input-error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .form-textarea {
      height: auto;
      padding: 10px 12px;
      line-height: 1.45;
      resize: vertical;
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      padding-right: 36px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }

    .form-select option {
      background-color: #ffffff;
      color: #0f172a;
    }

    .error-message {
      font-size: 0.78rem;
      color: #ef4444;
    }

    .server-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 10px 12px;
      border-radius: 10px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 0.825rem;
      font-weight: 600;
    }

    .confirmation-group {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 18px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background-color: #f8fafc;
    }

    .confirmation-group.confirmation-error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .confirmation-checkbox {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      cursor: pointer;
    }

    .confirmation-label {
      font-size: 0.825rem;
      line-height: 1.4;
      color: #334155;
      font-weight: 600;
      cursor: pointer;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px 24px 24px;
    }

    .secondary-button {
      height: 42px;
      padding: 0 18px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background-color: #ffffff;
      color: #334155;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    .secondary-button:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    .primary-button {
      height: 42px;
      padding: 0 20px;
      border: none;
      border-radius: 10px;
      background-color: #0099ff;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .primary-button:hover:not(:disabled) {
      background-color: #0088e6;
    }

    .secondary-button:disabled,
    .primary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EngineFormModalComponent implements OnInit {
  @Input() engine: EngineModel | null = null;
  @Input() isSubmitting = false;
  @Input() serverFieldErrors: Record<string, string> | null = null;
  @Input() errorMessage: string | null = null;
  @Output() submitEngineForm = new EventEmitter<EnginePayload>();
  @Output() closeModal = new EventEmitter<void>();

  readonly aspirationOptions: EngineAspirationType[] = ['ASPIRADO', 'TURBO', 'SUPERCHARGER'];

  readonly aspirationLabels: Record<EngineAspirationType, string> = {
    ASPIRADO: 'Aspirado',
    TURBO: 'Turbo',
    SUPERCHARGER: 'Supercharger'
  };

  engineForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.engineForm = this.formBuilder.group({
      manufacturer: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(255)]],
      displacementLiters: [
        null,
        [Validators.required, Validators.min(0), decimalPlacesValidator(2, 1)]
      ],
      displacementCc: [null, [Validators.required, Validators.min(1), integerValueValidator]],
      compressionRatio: [
        null,
        [Validators.required, Validators.min(0.1), decimalPlacesValidator(3, 1)]
      ],
      rpmCutoff: [null, [Validators.required, Validators.min(1), integerValueValidator]],
      aspirationType: ['ASPIRADO', [Validators.required]],
      confirmation: [false, [Validators.requiredTrue]]
    });
  }

  get isEditMode(): boolean {
    return this.engine !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Editar motor' : 'Cadastrar motor';
  }

  get submitButtonLabel(): string {
    return this.isEditMode ? 'Salvar alterações' : 'Cadastrar motor';
  }

  get confirmationLabel(): string {
    return this.isEditMode
      ? 'Confirmo que as alterações informadas estão corretas.'
      : 'Confirmo que os dados informados estão corretos e podem ser cadastrados.';
  }

  ngOnInit(): void {
    if (this.engine === null) {
      return;
    }

    this.engineForm.patchValue({
      manufacturer: this.engine.manufacturer,
      name: this.engine.name,
      description: this.engine.description,
      displacementLiters: this.engine.displacementLiters,
      displacementCc: this.engine.displacementCc,
      compressionRatio: this.engine.compressionRatio,
      rpmCutoff: this.engine.rpmCutoff,
      aspirationType: this.normalizeAspirationType(this.engine.aspirationType)
    });
  }


  normalizeAspirationType(rawValue: string): EngineAspirationType {
    const matchedOption = this.aspirationOptions.find(
      (aspirationOption) => aspirationOption === rawValue.toUpperCase()
    );

    return matchedOption ?? 'ASPIRADO';
  }

  isFieldInvalid(fieldName: string): boolean {
    const fieldControl = this.engineForm.get(fieldName);
    return !!(fieldControl && fieldControl.invalid && (fieldControl.dirty || fieldControl.touched));
  }

  getServerFieldError(fieldName: string): string | null {
    return this.serverFieldErrors?.[fieldName] ?? null;
  }

  handleFormSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.engineForm.invalid) {
      this.engineForm.markAllAsTouched();
      return;
    }

    const formValue = this.engineForm.value;

    this.submitEngineForm.emit({
      manufacturer: String(formValue['manufacturer']).trim(),
      name: String(formValue['name']).trim(),
      description: String(formValue['description'] ?? '').trim(),
      displacementLiters: Number(formValue['displacementLiters']),
      displacementCc: Number(formValue['displacementCc']),
      compressionRatio: Number(formValue['compressionRatio']),
      rpmCutoff: Number(formValue['rpmCutoff']),
      aspirationType: formValue['aspirationType'] as EngineAspirationType
    });
  }

  handleClose(): void {
    if (this.isSubmitting) {
      return;
    }
    this.closeModal.emit();
  }

  handleBackdropClick(mouseEvent: MouseEvent): void {
    if (mouseEvent.target === mouseEvent.currentTarget) {
      this.handleClose();
    }
  }
}
