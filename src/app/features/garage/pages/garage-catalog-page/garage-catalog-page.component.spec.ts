import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GarageCatalogPageComponent } from './garage-catalog-page.component';
import { AuthService } from '../../../../core/services/auth.service';
import { EngineService } from '../../../../core/services/engine.service';
import { EngineModel, PageResponse } from '../../../../core/models/engine.model';
import { UserModel } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';


const buildEngine = (): EngineModel => ({
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
    isSelected: true
});

const buildEnginePage = (engines: EngineModel[]): PageResponse<EngineModel> => ({
  content: engines,
  page: 0,
  size: 12,
  totalElements: engines.length,
  totalPages: engines.length > 0 ? 1 : 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
  sort: 'id,ASC'
});

const buildEngineServiceStub = () => {
  const engine = buildEngine();
  return {
    getEnginesPage: () => of(buildEnginePage([engine])),
    getSelectedEngine: () => of(engine),
    selectEngine: () => of(engine),
    createEngine: () => of(engine),
    updateEngine: () => of(engine),
    deleteEngine: () => of(undefined)
  };
};

const buildUser = (role: UserProfileType): UserModel => ({
  id: '1',
  fullName: 'Usuário Teste',
  email: 'usuario@email.com',
  role,
  active: true
});

const buildAuthServiceStub = (role: UserProfileType) => {
  const isAdmin = role === UserProfileType.ADMIN;
  return {
    currentUser$: of(buildUser(role)),
    isAdmin$: of(isAdmin),
    isAdmin: () => isAdmin,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined
  };
};

describe('GarageCatalogPageComponent', () => {
  const configureTestingModule = async (role: UserProfileType) => {
    await TestBed.configureTestingModule({
      imports: [GarageCatalogPageComponent],
      providers: [
        provideRouter([]),
        { provide: EngineService, useValue: buildEngineServiceStub() },
        { provide: AuthService, useValue: buildAuthServiceStub(role) }
      ]
    }).compileComponents();
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(GarageCatalogPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should hide the create, edit and delete actions for non-admin users', async () => {
    await configureTestingModule(UserProfileType.STUDENT);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.create-engine-button')).toBeNull();
    expect(element.querySelector('.edit-button')).toBeNull();
    expect(element.querySelector('.delete-button')).toBeNull();
    expect(element.querySelector('.action-button')).not.toBeNull();
  });

  it('should show the create, edit and delete actions for admin users', async () => {
    await configureTestingModule(UserProfileType.ADMIN);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.create-engine-button')).not.toBeNull();
    expect(element.querySelector('.edit-button')).not.toBeNull();
    expect(element.querySelector('.delete-button')).not.toBeNull();
  });
});
