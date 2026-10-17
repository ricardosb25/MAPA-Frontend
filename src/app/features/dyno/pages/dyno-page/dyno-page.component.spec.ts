import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DynoPageComponent } from './dyno-page.component';
import { DynoResult } from '../../../../core/models/dyno.model';
import { EngineModel } from '../../../../core/models/engine.model';
import { DynoService } from '../../../../core/services/dyno.service';
import { EngineService } from '../../../../core/services/engine.service';
import { AuthService } from '../../../../core/services/auth.service';
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

const buildResult = (statusFinal: DynoResult['statusFinal'] = 'INTEGRO'): DynoResult => ({
  rpmEixoX: [1000, 1250, 1500],
  curvaPotencia: [30.5, 41.2, 52.0],
  curvaTorque: [11.5, 12.1, 12.4],
  curvaAfr: [13.8, 14.0, 14.2],
  statusFinal,
  picoPotencia: statusFinal === 'INTEGRO' ? 131.5 : 60.0,
  picoTorque: 15.7
});

const buildEngineServiceStub = (engine: EngineModel | null) => ({
  getEnginesPage: () =>
    of({
      content: engine ? [engine] : [],
      page: 0,
      size: 12,
      totalElements: engine ? 1 : 0,
      totalPages: 1,
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

const buildDynoServiceStub = (result: DynoResult | null, shouldFail = false) => {
  const runCalls: number[] = [];
  return {
    runCalls,
    service: {
      runSimulation: () => {
        runCalls.push(1);
        return shouldFail
          ? throwError(
              () =>
                new HttpErrorResponse({
                  status: 400,
                  error: { message: 'Nenhum motor ativo selecionado.' }
                })
            )
          : of(result ?? buildResult());
      },
      getHistory: () => of([])
    }
  };
};

const buildAuthServiceStub = () => {
  const currentUser: UserModel = {
    id: '3',
    fullName: 'Ana Lima',
    email: 'ana@email.com',
    role: UserProfileType.STUDENT,
    active: true
  };
  return {
    currentUser$: of(currentUser),
    isAdmin$: of(false),
    isAdmin: () => false,
    getRole: () => UserProfileType.STUDENT,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined
  };
};

describe('DynoPageComponent', () => {
  const configureTestingModule = async (options: {
    engine: EngineModel | null;
    result?: DynoResult | null;
    shouldFail?: boolean;
  }) => {
    const dynoServiceStub = buildDynoServiceStub(options.result ?? null, options.shouldFail ?? false);

    await TestBed.configureTestingModule({
      imports: [DynoPageComponent],
      providers: [
        provideRouter([]),
        { provide: EngineService, useValue: buildEngineServiceStub(options.engine) },
        { provide: DynoService, useValue: dynoServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub() }
      ]
    }).compileComponents();

    return dynoServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(DynoPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should show the empty state when there is no active engine', async () => {
    await configureTestingModule({ engine: null });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state')).not.toBeNull();
    expect(element.querySelector('.chart-card')).toBeNull();
    expect(element.querySelector('.page-subtitle')?.textContent).toContain('Selecione um motor');
  });

  it('should show the engine subtitle, the run button and the waiting health state', async () => {
    await configureTestingModule({ engine: buildEngine() });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.page-subtitle')?.textContent).toContain('Volkswagen AP 1.8 8V');
    expect(element.querySelector('.page-subtitle')?.textContent).toContain('6500 rpm');
    expect(element.querySelector('.run-button')).not.toBeNull();
    expect(element.querySelector('.health-waiting')?.textContent).toContain(
      'Aguardando primeira passada'
    );
    expect(element.querySelector('.chart-placeholder')).not.toBeNull();
  });

  it('should render curves, peaks and healthy status after running the simulation', async () => {
    const dynoServiceStub = await configureTestingModule({
      engine: buildEngine(),
      result: buildResult('INTEGRO')
    });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const runButton = element.querySelector('.run-button') as HTMLButtonElement;
    runButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dynoServiceStub.runCalls).toHaveLength(1);
    expect(element.querySelector('app-dyno-chart')).not.toBeNull();
    expect(element.querySelector('.chart-placeholder')).toBeNull();
    expect(element.querySelector('.stat-power')?.textContent).toContain('131.5 cv');
    expect(element.querySelector('.health-ok')).not.toBeNull();
    expect(element.querySelector('.health-status')?.textContent).toContain('Motor íntegro');
  });

  it('should evaluate the mocked challenge criteria after the run', async () => {
    await configureTestingModule({ engine: buildEngine(), result: buildResult('INTEGRO') });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.run-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    const challengeCard = element.querySelector('.challenge-card');
    expect(challengeCard).not.toBeNull();
    expect(challengeCard?.querySelector('.progress-label')?.textContent).toContain('3/3 critérios');
  });

  it('should show the broken status when the engine fails', async () => {
    await configureTestingModule({
      engine: buildEngine(),
      result: buildResult('QUEBRADO_DETONACAO')
    });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.run-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.health-broken')).not.toBeNull();
    expect(element.querySelector('.health-status')?.textContent).toContain('detonação');
    expect(element.querySelector('.health-rpm')?.textContent).toContain('RPM');
  });

  it('should show an error feedback when the API rejects the run', async () => {
    await configureTestingModule({ engine: buildEngine(), shouldFail: true });
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.run-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.feedback-error')?.textContent).toContain(
      'Nenhum motor ativo selecionado.'
    );
    expect(element.querySelector('app-dyno-chart')).toBeNull();
  });
});
