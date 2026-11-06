import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent]
    }).compileComponents();
  });

  const createDialog = (): ConfirmDialogComponent => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('title', 'Excluir motor');
    fixture.componentRef.setInput('message', 'Deseja realmente excluir o motor AP 1.8 8V?');
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should start with the confirmation checkbox unchecked', () => {
    const component = createDialog();

    expect(component.isConfirmationChecked).toBe(false);
    expect(component.confirmationControl.hasError('required')).toBe(true);
  });

  it('should not emit confirm while the confirmation checkbox is unchecked', () => {
    const component = createDialog();
    let confirmEmissions = 0;

    component.confirm.subscribe(() => {
      confirmEmissions += 1;
    });
    component.handleConfirm();

    expect(confirmEmissions).toBe(0);
    expect(component.isConfirmationInvalid).toBe(true);
  });

  it('should emit confirm after the confirmation checkbox is checked', () => {
    const component = createDialog();
    let confirmEmissions = 0;

    component.confirm.subscribe(() => {
      confirmEmissions += 1;
    });
    component.confirmationControl.setValue(true);
    component.handleConfirm();

    expect(confirmEmissions).toBe(1);
    expect(component.confirmationControl.valid).toBe(true);
  });

  it('should not emit cancel while the deletion request is in progress', () => {
    const component = createDialog();
    let cancelEmissions = 0;

    component.cancel.subscribe(() => {
      cancelEmissions += 1;
    });
    component.isConfirming = true;
    component.handleCancel();

    expect(cancelEmissions).toBe(0);

    component.isConfirming = false;
    component.handleCancel();

    expect(cancelEmissions).toBe(1);
  });

  it('confirms actions that do not require a checkbox', () => {
    const component = createDialog();
    component.confirmationRequired = false;
    let confirmEmissions = 0;
    component.confirm.subscribe(() => confirmEmissions += 1);
    component.handleConfirm();
    expect(confirmEmissions).toBe(1);
  });

  it('blocks confirmation and dialog dismissal while a request is pending', () => {
    const component = createDialog();
    component.confirmationRequired = false;
    component.isConfirming = true;
    let emissions = 0;
    component.confirm.subscribe(() => emissions += 1);
    component.cancel.subscribe(() => emissions += 1);
    component.handleConfirm();
    component.handleVisibilityChange(false);
    expect(emissions).toBe(0);
    component.isConfirming = false;
    component.handleVisibilityChange(false);
    expect(emissions).toBe(1);
  });
});
