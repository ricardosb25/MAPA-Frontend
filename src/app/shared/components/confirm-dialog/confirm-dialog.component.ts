import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, MessageModule, LoadingComponent],
  template: `
    <p-dialog [header]="title" [visible]="true" [modal]="true" [draggable]="false"
      [style]="{ width: 'min(92vw, 520px)' }" styleClass="mapa-dialog"
      [closable]="!isConfirming" [closeOnEscape]="!isConfirming" [dismissableMask]="!isConfirming"
      (visibleChange)="handleVisibilityChange($event)">
      <p class="dialog-message">{{ message }}</p>
      @if (confirmationRequired) {
        <div class="confirmation-group">
          <label><input type="checkbox" [formControl]="confirmationControl" /> {{ confirmationLabel }}</label>
        </div>
        @if (isConfirmationInvalid) {
          <small class="confirmation-error">É necessário marcar a confirmação para prosseguir</small>
        }
      }
      @if (errorMessage) { <p-message severity="error">{{ errorMessage }}</p-message> }
      @if (isConfirming) { <app-loading variant="inline" [message]="confirmingLabel" /> }
      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [outlined]="true"
          [disabled]="isConfirming" (onClick)="handleCancel()" />
        <p-button [label]="confirmButtonLabel" [icon]="confirmIcon" [severity]="severity"
          [disabled]="isConfirming || (confirmationRequired && !isConfirmationChecked)" (onClick)="handleConfirm()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dialog-message { margin: 0 0 18px; color: var(--mapa-gray-600); font-size: .9rem; line-height: 1.6; }
    .confirmation-group { padding: 12px; border: 1px solid var(--mapa-gray-300); border-radius: 10px; background: var(--mapa-gray-50); }
    label { display: flex; align-items: flex-start; gap: 10px; color: var(--mapa-gray-700); font-size: .825rem; font-weight: 600; line-height: 1.5; cursor: pointer; }
    input { flex-shrink: 0; }
    .confirmation-error { display: block; margin-top: 6px; color: var(--mapa-danger); }
    p-message { display: block; margin-top: 12px; }
  `]
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmationLabel = 'Confirmo que desejo prosseguir com esta ação.';
  @Input() confirmationRequired = true;
  @Input() isConfirming = false;
  @Input() errorMessage: string | null = null;
  @Input() confirmButtonLabel = 'Confirmar';
  @Input() confirmingLabel = 'Confirmando...';
  @Input() confirmIcon = 'pi pi-trash';
  @Input() severity: 'danger' | 'secondary' | 'warn' = 'danger';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly confirmationControl = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });

  get isConfirmationChecked(): boolean { return this.confirmationControl.value; }
  get isConfirmationInvalid(): boolean { return this.confirmationRequired && this.confirmationControl.invalid && this.confirmationControl.touched; }

  handleConfirm(): void {
    if (this.isConfirming) return;
    if (this.confirmationRequired && !this.isConfirmationChecked) {
      this.confirmationControl.markAsTouched();
      return;
    }
    this.confirm.emit();
  }

  handleCancel(): void {
    if (!this.isConfirming) this.cancel.emit();
  }

  handleVisibilityChange(visible: boolean): void {
    if (!visible) this.handleCancel();
  }
}
