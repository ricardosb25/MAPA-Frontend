import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EngineCardComponent } from './engine-card.component';
import { EngineModel } from '../../../../core/models/engine.model';

describe('EngineCardComponent', () => {
  const engine: EngineModel = {
    id: 101,
    manufacturer: 'Volkswagen',
    name: 'AP 1.8',
    description: 'Motor Volkswagen AP 1.8, conhecido por sua confiabilidade e desempenho.',
    displacementLiters: 1.8,
    displacementCc: 1800,
    compressionRatio: 9.0,
    rpmCutoff: 6500,
    aspirationType: 'ASPIRADO',
    createdAt: '2026-01-01T00:00:00Z',
    isSelected: false
  };

  const createFixture = (canManage: boolean) => {
    const fixture = TestBed.createComponent(EngineCardComponent);
    fixture.componentRef.setInput('engine', engine);
    fixture.componentRef.setInput('canManage', canManage);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngineCardComponent]
    }).compileComponents();
  });

  it('should hide the edit and delete buttons when canManage is false', () => {
    const fixture = createFixture(false);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.edit-button')).toBeNull();
    expect(element.querySelector('.delete-button')).toBeNull();
    expect(element.querySelector('.action-button')).not.toBeNull();
  });

  it('should show the edit and delete buttons when canManage is true', () => {
    const fixture = createFixture(true);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.edit-button')).not.toBeNull();
    expect(element.querySelector('.delete-button')).not.toBeNull();
  });

  it('should emit editEngine when the edit button is clicked', () => {
    const fixture = createFixture(true);
    const component = fixture.componentInstance;
    const emittedEngines: EngineModel[] = [];
    component.editEngine.subscribe((editedEngine) => emittedEngines.push(editedEngine));

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.edit-button')?.click();

    expect(emittedEngines).toHaveLength(1);
    expect(emittedEngines[0]?.id).toBe(engine.id);
  });

  it('should emit deleteEngine when the delete button is clicked', () => {
    const fixture = createFixture(true);
    const component = fixture.componentInstance;
    const emittedEngines: EngineModel[] = [];
    component.deleteEngine.subscribe((deletedEngine) => emittedEngines.push(deletedEngine));

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.delete-button')?.click();

    expect(emittedEngines).toHaveLength(1);
    expect(emittedEngines[0]?.id).toBe(engine.id);
  });
});
