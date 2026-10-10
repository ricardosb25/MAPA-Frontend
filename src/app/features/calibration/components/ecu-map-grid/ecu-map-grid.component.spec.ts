import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EcuMapGridComponent } from './ecu-map-grid.component';
import { EcuMapCellUpdate, EcuMapGrid } from '../../../../core/models/ecu-map.model';

const buildMap = (overrides: Partial<EcuMapGrid> = {}): EcuMapGrid => ({
  motorId: 101,
  displacementClass: 1.8,
  mapType: 'IGNITION',
  label: 'Mapa de ignição',
  unit: 'graus de avanço',
  rpmBreakpoints: [1000, 2000, 3000],
  loadBreakpoints: [100, 85],
  values: [
    [10, 15, 20],
    [12, 17, 22]
  ],
  defaultValues: [
    [10, 15, 20],
    [12, 17, 22]
  ],
  minValue: 0,
  maxValue: 45,
  step: 1,
  factoryDefault: true,
  updatedAt: null,
  ...overrides
});

describe('EcuMapGridComponent', () => {
  let capturedCellUpdates: EcuMapCellUpdate[];

  const createFixture = async (map: EcuMapGrid) => {
    capturedCellUpdates = [];
    const fixture = TestBed.createComponent(EcuMapGridComponent);
    fixture.componentInstance.map = map;
    fixture.componentInstance.cellSave.subscribe((cellUpdate) => capturedCellUpdates.push(cellUpdate));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [EcuMapGridComponent] });
  });

  it('should render the rpm and load axes with every cell value', async () => {
    const fixture = await createFixture(buildMap());
    const element = fixture.nativeElement as HTMLElement;

    const rpmHeaders = Array.from(element.querySelectorAll('.rpm-header')).map(
      (header) => header.textContent?.trim()
    );
    expect(rpmHeaders).toEqual(['1000', '2000', '3000']);

    const loadHeaders = Array.from(element.querySelectorAll('.load-header')).map(
      (header) => header.textContent?.trim()
    );
    expect(loadHeaders).toEqual(['100%', '85%']);

    const cellValues = Array.from(element.querySelectorAll('.cell-button')).map(
      (cell) => cell.textContent?.trim()
    );
    expect(cellValues).toEqual(['10', '15', '20', '12', '17', '22']);
  });

  it('should emit the informed value when a valid cell edit is committed', async () => {
    const fixture = await createFixture(buildMap());
    const element = fixture.nativeElement as HTMLElement;

    const firstCell = element.querySelector('.cell-button') as HTMLButtonElement;
    firstCell.click();
    fixture.detectChanges();

    const cellInput = element.querySelector('.cell-input') as HTMLInputElement;
    expect(cellInput).not.toBeNull();
    expect(cellInput.min).toBe('0');
    expect(cellInput.max).toBe('45');

    cellInput.value = '30';
    cellInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    cellInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(capturedCellUpdates).toEqual([{ loadIndex: 0, rpmIndex: 0, value: 30 }]);
  });

  it('should block values outside the realistic ECU range', async () => {
    const fixture = await createFixture(buildMap());
    const element = fixture.nativeElement as HTMLElement;

    const firstCell = element.querySelector('.cell-button') as HTMLButtonElement;
    firstCell.click();
    fixture.detectChanges();

    const cellInput = element.querySelector('.cell-input') as HTMLInputElement;
    cellInput.value = '999';
    cellInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    cellInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(capturedCellUpdates).toHaveLength(0);
    expect(element.querySelector('.validation-message')?.textContent).toContain(
      'Valor fora do intervalo permitido'
    );
  });

  it('should cancel the edit without emitting when escape is pressed', async () => {
    const fixture = await createFixture(buildMap());
    const element = fixture.nativeElement as HTMLElement;

    const firstCell = element.querySelector('.cell-button') as HTMLButtonElement;
    firstCell.click();
    fixture.detectChanges();

    const cellInput = element.querySelector('.cell-input') as HTMLInputElement;
    cellInput.value = '33';
    cellInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    cellInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(capturedCellUpdates).toHaveLength(0);
    expect(element.querySelector('.cell-input')).toBeNull();
    expect(element.querySelector('.cell-button')?.textContent?.trim()).toBe('10');
  });
});
