import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    '(document:keydown.escape)': 'handleCancel()'
  },
  template: `
    <div class="dialog-backdrop" (click)="handleBackdropClick($event)">
      <div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="confirmDialogTitle">
        <header class="dialog-header">
          <div class="dialog-header-text">
            <span class="dialog-tag">CONFIRMAÇÃO</span>
            <h2 class="dialog-title" id="confirmDialogTitle">{{ title }}</h2>
          </div>
          <button
            type="button"
            class="dialog-close-button"
            [disabled]="isConfirming"
            (click)="handleCancel()"
            aria-label="Fechar"
          >
            <i class="pi pi-times"></i>
          </button>
        </header>

        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>

          <div class="confirmation-group" [class.confirmation-error]="isConfirmationInvalid">
            <input
              type="checkbox"
              id="deleteConfirmationCheckbox"
              class="confirmation-checkbox"
              [formControl]="confirmationControl"
            />
            <label for="deleteConfirmationCheckbox" class="confirmation-label">
              {{ confirmationLabel }}
            </label>
          </div>

          @if (isConfirmationInvalid) {
            <span class="error-message">É necessário marcar a confirmação para prosseguir.</span>
          }

          @if (errorMessage) {
            <div class="server-error-banner">
              <i class="pi pi-exclamation-triangle"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }
        </div>

        <footer class="dialog-footer">
          <button
            type="button"
            class="secondary-button"
            [disabled]="isConfirming"
            (click)="handleCancel()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="danger-button"
            [disabled]="isConfirming || !isConfirmationChecked"
            (click)="handleConfirm()"
          >
            @if (isConfirming) {
              <i class="pi pi-spin pi-spinner"></i>
              <span>Excluindo...</span>
            } @else {
              <i class="fa-solid fa-trash"></i>
              <span>Excluir motor</span>
            }
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }

    .dialog-card {
      width: 100%;
      max-width: 460px;
      background-color: #ffffff;
      border-radius: 14px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: auto;
    }

    .dialog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px 0 24px;
    }

    .dialog-tag {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #b91c1c;
    }

    .dialog-title {
      margin: 4px 0 0 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .dialog-close-button {
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }

    .dialog-close-button:hover:not(:disabled) {
      color: #0f172a;
      background-color: #f1f5f9;
    }

    .dialog-body {
      padding: 16px 24px 0 24px;
    }

    .dialog-message {
      margin: 0 0 16px 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #475569;
    }

    .confirmation-group {
      display: flex;
      align-items: flex-start;
      gap: 10px;
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
      width: 16px;
      height: 16px;
      margin-top: 2px;
      accent-color: #dc2626;
      cursor: pointer;
    }

    .confirmation-label {
      font-size: 0.825rem;
      line-height: 1.4;
      color: #334155;
      font-weight: 600;
      cursor: pointer;
    }

    .error-message {
      display: block;
      margin-top: 6px;
      font-size: 0.8rem;
      color: #ef4444;
    }

    .server-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 0.825rem;
      font-weight: 600;
    }

    .dialog-footer {
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

    .danger-button {
      height: 42px;
      padding: 0 18px;
      border: none;
      border-radius: 10px;
      background-color: #dc2626;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .danger-button:hover:not(:disabled) {
      background-color: #b91c1c;
    }

    .secondary-button:disabled,
    .danger-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmationLabel = 'Confirmo que desejo prosseguir com esta ação.';
  @Input() isConfirming = false;
  @Input() errorMessage: string | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly confirmationControl: FormControl<boolean>;

  constructor(private readonly formBuilder: FormBuilder) {
    this.confirmationControl = this.formBuilder.nonNullable.control(false, Validators.requiredTrue);
  }

  get isConfirmationChecked(): boolean {
    return this.confirmationControl.value === true;
  }

  get isConfirmationInvalid(): boolean {
    return this.confirmationControl.invalid && this.confirmationControl.touched;
  }

  handleConfirm(): void {
    if (this.isConfirming) {
      return;
    }

    if (!this.isConfirmationChecked) {
      this.confirmationControl.markAsTouched();
      return;
    }

    this.confirm.emit();
  }

  handleCancel(): void {
    if (this.isConfirming) {
      return;
    }
    this.cancel.emit();
  }

  handleBackdropClick(mouseEvent: MouseEvent): void {
    if (mouseEvent.target === mouseEvent.currentTarget) {
      this.handleCancel();
    }
  }
}