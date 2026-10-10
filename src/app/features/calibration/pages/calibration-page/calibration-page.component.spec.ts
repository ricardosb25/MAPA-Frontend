import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CalibrationPageComponent } from './calibration-page.component';
import { AuthService } from '../../../../core/services/auth.service';
import { EcuMapService } from '../../../../core/services/ecu-map.service';
import { EngineService } from '../../../../core/services/engine.service';
import { EcuMapGrid, EcuMapType } from '../../../../core/models/ecu-map.model';
import { EngineModel } from '../../../../core/models/engine.model';
import { UserModel } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';

const buildEngine = (overrides: Partial<EngineModel> = {}): EngineModel => ({
  id: 101,
  manufacturer: 'Volkswagen',
  name: 'AP 1.8 8V',
  description: 'Motor didático.',
  displacementLiters: 1.8,
  displacementCc: 1781,
  compressionRatio: 9.2,
  rpmCutoff: 6500,
  aspirationType: 'ASPIRADO',
  createdAt: '2026-01-01T00:00:00Z',
  isSelected: true,
  ...overrides
});

const buildMap = (mapType: EcuMapType): EcuMapGrid => ({
  motorId: 101,
  displacementClass: 1.8,
  mapType,
  label: mapType === 'IGNITION' ? 'Mapa de ignição' : 'Mapa de combustível',
  unit: mapType === 'IGNITION' ? 'graus de avanço' : 'VE %',
  rpmBreakpoints: [1000, 2000],
  loadBreakpoints: [100, 85],
  values: [
    [10, 15],
    [12, 17]
  ],
  defaultValues: [
    [10, 15],
    [12, 17]
  ],
  minValue: mapType === 'IGNITION' ? 0 : 10,
  maxValue: mapType === 'IGNITION' ? 45 : 100,
  step: 1,
  factoryDefault: true,
  updatedAt: null
});

const buildEngineServiceStub = (engine: EngineModel | null) => ({
  getEnginesPage: () =>
    of({
      content: engine ? [engine] : [],
      page: 0,
      size: 12,
      totalElements: engine ? 1 : 0,
      totalPages: engine ? 1 : 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
      sort: 'id,ASC'
    }),
  getSelectedEngine: () => of(engine),
  selectEngine: () => of(engine),
  createEngine: () => of(engine),
  updateEngine: () => of(engine),
  deleteEngine: () => of(undefined)
});

const buildEcuMapServiceStub = () => {
  const restoreCalls: { engineId: string | number; mapType: EcuMapType }[] = [];
  const updateCalls: { engineId: string | number; mapType: EcuMapType; value: number }[] = [];
  return {
    restoreCalls,
    updateCalls,
    service: {
      getEngineMaps: () => of([buildMap('IGNITION'), buildMap('FUEL')]),
      updateCell: (engineId: string | number, mapType: EcuMapType, cellUpdate: { value: number }) => {
        updateCalls.push({ engineId, mapType, value: cellUpdate.value });
        return of(buildMap(mapType));
      },
      restoreFactoryMap: (engineId: string | number, mapType: EcuMapType) => {
        restoreCalls.push({ engineId, mapType });
        return of(buildMap(mapType));
      }
    }
  };
};

const buildAuthServiceStub = (role: UserProfileType) => {
  const currentUser: UserModel = {
    id: '3',
    fullName: 'Ana Lima',
    email: 'ana@email.com',
    role,
    active: true
  };
  const isAdmin = role === UserProfileType.ADMIN;
  return {
    currentUser$: of(currentUser),
    isAdmin$: of(isAdmin),
    isAdmin: () => isAdmin,
    getRole: () => role,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined
  };
};

describe('CalibrationPageComponent', () => {
  const configureTestingModule = async (options: {
    role: UserProfileType;
    engine: EngineModel | null;
  }) => {
    const ecuMapServiceStub = buildEcuMapServiceStub();

    await TestBed.configureTestingModule({
      imports: [CalibrationPageComponent],
      providers: [
        provideRouter([]),
        { provide: EngineService, useValue: buildEngineServiceStub(options.engine) },
        { provide: EcuMapService, useValue: ecuMapServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub(options.role) }
      ]
    }).compileComponents();

    return ecuMapServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(CalibrationPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should show the active challenge card for students with an active challenge', async () => {
    await configureTestingModule({ role: UserProfileType.STUDENT, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.challenge-card')).not.toBeNull();
    expect(element.querySelector('.challenge-title')?.textContent).toContain(
      'Falta de potência em alta rotação'
    );
  });

  it('should hide the active challenge card for teachers', async () => {
    await configureTestingModule({ role: UserProfileType.TEACHER, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.challenge-card')).toBeNull();
  });

  it('should hide the active challenge card for admins', async () => {
    await configureTestingModule({ role: UserProfileType.ADMIN, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.challenge-card')).toBeNull();
  });

  it('should show the empty state when there is no active engine', async () => {
    await configureTestingModule({ role: UserProfileType.STUDENT, engine: null });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state')).not.toBeNull();
    expect(element.querySelector('.map-card')).toBeNull();
    expect(element.querySelector('.page-subtitle')?.textContent).toContain(
      'Selecione um motor no catálogo'
    );
  });

  it('should show the active engine badge with the engine on the bench', async () => {
    await configureTestingModule({ role: UserProfileType.STUDENT, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const badge = element.querySelector('.active-engine-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('NA BANCADA');
    expect(badge?.textContent).toContain('Volkswagen AP 1.8 8V');
  });

  it('should hide the active engine badge when there is no active engine', async () => {
    await configureTestingModule({ role: UserProfileType.STUDENT, engine: null });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.active-engine-badge')).toBeNull();
  });

  it('should render the active engine maps with the factory default status', async () => {
    await configureTestingModule({ role: UserProfileType.TEACHER, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.page-subtitle')?.textContent).toContain('Volkswagen AP 1.8 8V');
    expect(element.querySelector('.map-card-title')?.textContent).toContain(
      'MAPA DE COMBUSTÍVEL — VE %'
    );
    expect(element.querySelector('.map-status')?.textContent).toContain('Mapa de fábrica');
    expect(element.querySelectorAll('.cell-button').length).toBe(4);
  });

  it('should switch the active map when the ignition button is clicked', async () => {
    await configureTestingModule({ role: UserProfileType.STUDENT, engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const ignitionButton = Array.from(element.querySelectorAll('.map-type-button')).find(
      (button) => button.textContent?.includes('Ignição')
    ) as HTMLButtonElement;
    ignitionButton.click();
    fixture.detectChanges();

    expect(element.querySelector('.map-card-title')?.textContent).toContain(
      'MAPA DE IGNIÇÃO — GRAUS DE AVANÇO'
    );
  });

  it('should restore the factory map after the confirmation step', async () => {
    const ecuMapServiceStub = await configureTestingModule({
      role: UserProfileType.STUDENT,
      engine: buildEngine()
    });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const restoreButton = Array.from(element.querySelectorAll('.sidebar-button')).find(
      (button) => button.textContent?.includes('Restaurar mapa de fábrica')
    ) as HTMLButtonElement;
    restoreButton.click();
    fixture.detectChanges();

    const confirmButton = element.querySelector('.confirm-accept-button') as HTMLButtonElement;
    expect(confirmButton).not.toBeNull();
    confirmButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(ecuMapServiceStub.restoreCalls).toHaveLength(1);
    expect(ecuMapServiceStub.restoreCalls[0]).toEqual({ engineId: 101, mapType: 'FUEL' });
    expect(element.querySelector('.feedback-toast')?.textContent).toContain(
      'Mapa restaurado para o padrão de fábrica'
    );
  });
});
