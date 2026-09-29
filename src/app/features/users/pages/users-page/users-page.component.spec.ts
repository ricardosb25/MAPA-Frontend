import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UsersPageComponent } from './users-page.component';
import { AdminUserService } from '../../../../core/services/admin-user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminUserModel, AdminUserQuery, AdminUserUpdatePayload } from '../../../../core/models/admin-user.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { UserModel } from '../../../../core/models/auth.model';

const buildUser = (overrides: Partial<AdminUserModel> = {}): AdminUserModel => ({
  id: 1,
  fullName: 'Ricardo Bissaco',
  email: 'ricardo@mapa.edu',
  role: UserProfileType.ADMIN,
  active: true,
  createdAt: '2026-01-10T00:00:00Z',
  ...overrides
});

const buildUsersPage = (users: AdminUserModel[]): PageResponse<AdminUserModel> => ({
  content: users,
  page: 0,
  size: 10,
  totalElements: users.length,
  totalPages: users.length > 0 ? 1 : 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
  sort: 'createdAt: ASC'
});

const buildAdminUserServiceStub = (users: AdminUserModel[]) => {
  const receivedQueries: AdminUserQuery[] = [];
  const receivedUpdates: { userId: number; payload: AdminUserUpdatePayload }[] = [];
  return {
    receivedQueries,
    receivedUpdates,
    service: {
      getUsersPage: (query: AdminUserQuery) => {
        receivedQueries.push(query);
        return of(buildUsersPage(users));
      },
      updateUser: (userId: number, payload: AdminUserUpdatePayload) => {
        receivedUpdates.push({ userId, payload });
        return of(buildUser({ active: payload.active }));
      }
    }
  };
};

const buildAuthServiceStub = () => {
  const currentUser: UserModel = {
    id: '9',
    fullName: 'Administrador',
    email: 'admin@mapa.edu',
    role: UserProfileType.ADMIN,
    active: true
  };
  return {
    currentUser$: of(currentUser),
    isAdmin$: of(true),
    isAdmin: () => true,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined
  };
};
describe('UsersPageComponent', () => {
  const users = [
    buildUser(),
    buildUser({
      id: 2,
      fullName: 'Ana Lima',
      email: 'ana@aluno.mapa.edu',
      role: UserProfileType.STUDENT,
      active: false,
      createdAt: '2026-03-01T00:00:00Z'
    })
  ];

  const configureTestingModule = async (adminUsers: AdminUserModel[]) => {
    const adminUserServiceStub = buildAdminUserServiceStub(adminUsers);
    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideRouter([]),
        { provide: AdminUserService, useValue: adminUserServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub() }
      ]
    }).compileComponents();
    return adminUserServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should render the user rows with profile, status and action', async () => {
    await configureTestingModule(users);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.page-title')?.textContent).toContain('Todos os usuários');
    expect(element.querySelector('.page-subtitle')?.textContent).toContain('2 contas cadastradas');

    const rows = element.querySelectorAll('.users-table tbody tr');
    expect(rows.length).toBe(2);

    const profileBadges = element.querySelectorAll('.profile-badge');
    expect(profileBadges[0]?.textContent).toContain('Administrador');
    expect(profileBadges[0]?.classList).toContain('profile-admin');
    expect(profileBadges[1]?.textContent).toContain('Aluno');
    expect(profileBadges[1]?.classList).toContain('profile-student');

    const statusBadges = element.querySelectorAll('.status-badge');
    expect(statusBadges[0]?.classList).toContain('status-active');
    expect(statusBadges[1]?.classList).toContain('status-inactive');

    const actionButtons = element.querySelectorAll('.toggle-button');
    expect(actionButtons[0]?.textContent).toContain('Desativar');
    expect(actionButtons[1]?.textContent).toContain('Ativar');
  });

  it('should show the empty state when no user is found', async () => {
    await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state')).not.toBeNull();
    expect(element.querySelector('.empty-state-title')?.textContent).toContain(
      'Nenhum usuário encontrado'
    );
    expect(element.querySelector('.users-table')).toBeNull();
  });

  it('should request the first page filtered by role when the profile select changes', async () => {
    const adminUserServiceStub = await configureTestingModule(users);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const profileSelect = element.querySelector('.profile-select') as HTMLSelectElement;
    profileSelect.value = 'STUDENT';
    profileSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const lastQuery = adminUserServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.role).toBe(UserProfileType.STUDENT);
    expect(lastQuery?.page).toBe(0);
  });

  it('should keep the filters when navigating to another page', async () => {
    const adminUserServiceStub = await configureTestingModule(users);
    const fixture = await createPageFixture();
    const component = fixture.componentInstance as UsersPageComponent;

    const profileSelect = (fixture.nativeElement as HTMLElement).querySelector(
      '.profile-select'
    ) as HTMLSelectElement;
    profileSelect.value = 'ADMIN';
    profileSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    component.handlePageChange(2);
    fixture.detectChanges();

    const lastQuery = adminUserServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.role).toBe(UserProfileType.ADMIN);
    expect(lastQuery?.page).toBe(2);
  });

  it('should deactivate an active account through the admin user service', async () => {
    const adminUserServiceStub = await configureTestingModule(users);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const deactivateButton = element.querySelectorAll('.toggle-button')[0] as HTMLButtonElement;
    deactivateButton.click();
    fixture.detectChanges();

    expect(adminUserServiceStub.receivedUpdates.length).toBe(1);
    expect(adminUserServiceStub.receivedUpdates[0].userId).toBe(1);
    expect(adminUserServiceStub.receivedUpdates[0].payload.active).toBe(false);
    expect(element.querySelector('.feedback-toast')?.textContent).toContain('desativada');
  });

  it('should not allow changing the status of the logged admin account', async () => {
    const adminUserServiceStub = await configureTestingModule([
      buildUser({ id: 9, fullName: 'Administrador', email: 'admin@mapa.edu' })
    ]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const deactivateButton = element.querySelector('.toggle-button') as HTMLButtonElement;
    expect(deactivateButton.disabled).toBe(true);

    deactivateButton.click();
    fixture.detectChanges();

    expect(adminUserServiceStub.receivedUpdates.length).toBe(0);
  });
});

