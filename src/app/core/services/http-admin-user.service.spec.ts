import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpAdminUserService } from './http-admin-user.service';
import { AdminUserModel, AdminUserQuery } from '../models/admin-user.model';
import { PageResponse } from '../models/pagination.model';
import { UserProfileType } from '../models/user-profile.enum';
import { API_CONFIG } from '../config/api.config';

describe('HttpAdminUserService', () => {
  let service: HttpAdminUserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpAdminUserService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(HttpAdminUserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const baseQuery: AdminUserQuery = {
    search: '',
    role: null,
    page: 0,
    size: 10,
    sort: 'createdAt,ASC'
  };

  const buildUser = (overrides: Partial<AdminUserModel> = {}): AdminUserModel => ({
    id: 1,
    fullName: 'Ricardo Bissaco',
    email: 'ricardo@mapa.edu',
    role: UserProfileType.ADMIN,
    active: true,
    createdAt: '2026-01-10T00:00:00Z',
    ...overrides
  });

  const buildPage = (content: AdminUserModel[]): PageResponse<AdminUserModel> => ({
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
    sort: 'createdAt: ASC'
  });

  const matchesUsersRequest = (request: HttpRequest<unknown>): boolean =>
    request.method === 'GET' && request.url === API_CONFIG.endpoints.users;

  it('should fetch users with pagination params and read the page envelope', () => {
    service.getUsersPage(baseQuery).subscribe((usersPage) => {
      expect(usersPage.content.length).toBe(1);
      expect(usersPage.totalElements).toBe(1);
      expect(usersPage.content[0].fullName).toBe('Ricardo Bissaco');
      expect(usersPage.content[0].role).toBe(UserProfileType.ADMIN);
    });

    const pageRequest = httpTestingController.expectOne(matchesUsersRequest);
    expect(pageRequest.request.params.get('page')).toBe('0');
    expect(pageRequest.request.params.get('size')).toBe('10');
    expect(pageRequest.request.params.get('sort')).toBe('createdAt,ASC');
    expect(pageRequest.request.params.has('role')).toBe(false);
    expect(pageRequest.request.params.has('search')).toBe(false);
    pageRequest.flush(buildPage([buildUser()]));
  });

  it('should send the role and the trimmed search as query params', () => {
    service
      .getUsersPage({ ...baseQuery, role: UserProfileType.STUDENT, search: '  ana@aluno  ' })
      .subscribe();

    const pageRequest = httpTestingController.expectOne(matchesUsersRequest);
    expect(pageRequest.request.params.get('role')).toBe('STUDENT');
    expect(pageRequest.request.params.get('search')).toBe('ana@aluno');
    pageRequest.flush(buildPage([]));
  });

  it('should put the update payload to the user resource', () => {
    const updatedUser = buildUser({ active: false });
    service.updateUser(7, { fullName: 'Ana Lima', email: 'ana@aluno.mapa.edu', active: false })
      .subscribe((user) => {
        expect(user.active).toBe(false);
      });

    const updateRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'PUT' &&
        request.url === `${API_CONFIG.endpoints.users}/7`
    );
    expect(updateRequest.request.body).toEqual({
      fullName: 'Ana Lima',
      email: 'ana@aluno.mapa.edu',
      active: false
    });
    updateRequest.flush(updatedUser);
  });
});
