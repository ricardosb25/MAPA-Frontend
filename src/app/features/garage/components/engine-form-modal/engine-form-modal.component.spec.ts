import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EngineFormModalComponent } from './engine-form-modal.component';
import { EngineModel, EnginePayload } from '../../../../core/models/engine.model';

describe('EngineFormModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngineFormModalComponent]
    }).compileComponents();
  });

  const fillValidEngineFields = (component: EngineFormModalComponent): void => {
    component.engineForm.patchValue({
      manufacturer: 'HONDA',
      name: 'CG 160 Titan',
      description: 'Motor monocilíndrico de uso urbano.',
      displacementLiters: 0.2,
      displacementCc: 162,
      compressionRatio: 9.5,
      rpmCutoff: 8500,
      aspirationType: 'ASPIRADO'
    });
  };

  it('should keep the form invalid while the confirmation checkbox is unchecked', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;

    fillValidEngineFields(component);

    expect(component.engineForm.invalid).toBe(true);
    expect(component.engineForm.get('confirmation')?.hasError('required')).toBe(true);
  });

  it('should not emit the payload when the confirmation checkbox is unchecked', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;
    let emittedPayloads = 0;

    fillValidEngineFields(component);
    component.submitEngineForm.subscribe(() => {
      emittedPayloads += 1;
    });
    component.handleFormSubmit();

    expect(emittedPayloads).toBe(0);
    expect(component.isFieldInvalid('confirmation')).toBe(true);
  });

  it('should emit the payload without the confirmation key when the checkbox is checked', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;
    const emittedPayloads: EnginePayload[] = [];

    fillValidEngineFields(component);
    component.engineForm.patchValue({ confirmation: true });
    component.submitEngineForm.subscribe((payload) => {
      emittedPayloads.push(payload);
    });
    component.handleFormSubmit();

    expect(emittedPayloads.length).toBe(1);
    expect(emittedPayloads[0].name).toBe('CG 160 Titan');
    expect(emittedPayloads[0].manufacturer).toBe('HONDA');
    expect(emittedPayloads[0].displacementCc).toBe(162);
    expect(emittedPayloads[0].aspirationType).toBe('ASPIRADO');
    expect(Object.keys(emittedPayloads[0])).not.toContain('confirmation');
  });

  it('should offer the three aspiration options with their display labels', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;

    expect(component.aspirationOptions).toEqual(['ASPIRADO', 'TURBO', 'SUPERCHARGER']);
    expect(component.aspirationLabels.ASPIRADO).toBe('Aspirado');
    expect(component.aspirationLabels.TURBO).toBe('Turbo');
    expect(component.aspirationLabels.SUPERCHARGER).toBe('Supercharger');
  });

  it('should emit SUPERCHARGER when supercharger is selected and the checkbox is checked', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;
    const emittedPayloads: EnginePayload[] = [];

    fillValidEngineFields(component);
    component.engineForm.patchValue({ confirmation: true, aspirationType: 'SUPERCHARGER' });
    component.submitEngineForm.subscribe((payload) => {
      emittedPayloads.push(payload);
    });
    component.handleFormSubmit();

    expect(emittedPayloads.length).toBe(1);
    expect(emittedPayloads[0].aspirationType).toBe('SUPERCHARGER');
  });

  it('should normalize legacy aspiration values when editing', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;

    expect(component.normalizeAspirationType('Aspirado')).toBe('ASPIRADO');
    expect(component.normalizeAspirationType('turbo')).toBe('TURBO');
    expect(component.normalizeAspirationType('SUPERCHARGER')).toBe('SUPERCHARGER');
    expect(component.normalizeAspirationType('valor-legado')).toBe('ASPIRADO');
  });

  it('should reject values with more decimal places than the API accepts', () => {
    const fixture = TestBed.createComponent(EngineFormModalComponent);
    const component = fixture.componentInstance;

    fillValidEngineFields(component);
    component.engineForm.patchValue({ confirmation: true, displacementLiters: 1.85 });

    expect(component.engineForm.get('displacementLiters')?.hasError('decimalPlacesInvalid')).toBe(
      true
    );
  });

  it('should prefill the form and require the edit confirmation label when editing', () => {
    const engineToEdit: EngineModel = {
      id: 101,
      manufacturer: 'VOLKSWAGEN',
      name: 'AP 1.8 8V',
      description: 'Motor didático clássico.',
      displacementLiters: 1.8,
      displacementCc: 1781,
      compressionRatio: 9.2,
      rpmCutoff: 6500,
      aspirationType: 'TURBO',
      createdAt: '2026-09-12T00:00:00.000Z'
    };

    const fixture = TestBed.createComponent(EngineFormModalComponent);
    fixture.componentRef.setInput('engine', engineToEdit);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(true);
    expect(component.modalTitle).toBe('Editar motor');
    expect(component.engineForm.get('manufacturer')?.value).toBe('VOLKSWAGEN');
    expect(component.engineForm.get('compressionRatio')?.value).toBe(9.2);
    expect(component.confirmationLabel).toContain('alterações');
    expect(component.engineForm.get('confirmation')?.value).toBe(false);
  });
});