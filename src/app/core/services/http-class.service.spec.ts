import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClassService } from './http-class.service';
import { ClassModel, ClassQuery } from '../models/class.model';
import { PageResponse } from '../models/pagination.model';
import { API_CONFIG } from '../config/api.config';

describe('HttpClassService', () => {
  let service: HttpClassService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClassService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HttpClassService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const baseQuery: ClassQuery = {
    search: '',
    shift: null,
    page: 0,
    size: 6,
    sort: 'name,ASC',
  };

  const buildClass = (overrides: Partial<ClassModel> = {}): ClassModel => ({
    id: 1,
    name: 'Eletronica Embarcada 2A',
    code: 'AUT-2A',
    shift: 'AFTERNOON',
    professorName: 'Helena Duarte',
    studentCount: 2,
    createdAt: '2026-01-10T00:00:00Z',
    ...overrides,
  });

  const buildPage = (content: ClassModel[]): PageResponse<ClassModel> => ({
    content,
    page: 0,
    size: 6,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
    sort: 'name: ASC',
  });

  const matchesTeacherClassesRequest = (request: HttpRequest<unknown>): boolean =>
    request.method === 'GET' && request.url === API_CONFIG.endpoints.classes;

  it('should fetch teacher classes with pagination params', () => {
    service.getTeacherClassesPage(baseQuery).subscribe((classesPage) => {
      expect(classesPage.content.length).toBe(1);
      expect(classesPage.content[0].code).toBe('AUT-2A');
      expect(classesPage.totalElements).toBe(1);
    });

    const pageRequest = httpTestingController.expectOne(matchesTeacherClassesRequest);
    expect(pageRequest.request.params.get('page')).toBe('0');
    expect(pageRequest.request.params.get('size')).toBe('6');
    expect(pageRequest.request.params.get('sort')).toBe('name,ASC');
    expect(pageRequest.request.params.has('search')).toBe(false);
    expect(pageRequest.request.params.has('shift')).toBe(false);
    pageRequest.flush(buildPage([buildClass()]));
  });

  it('should send the trimmed search and the shift as query params', () => {
    service
      .getTeacherClassesPage({ ...baseQuery, search: '  eletronica  ', shift: 'EVENING' })
      .subscribe();

    const pageRequest = httpTestingController.expectOne(matchesTeacherClassesRequest);
    expect(pageRequest.request.params.get('search')).toBe('eletronica');
    expect(pageRequest.request.params.get('shift')).toBe('EVENING');
    pageRequest.flush(buildPage([]));
  });

  it('should fetch my classes from the mine endpoint with filters', () => {
    service.getMyClassesPage({ ...baseQuery, shift: 'MORNING' }).subscribe();

    const pageRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'GET' && request.url === `${API_CONFIG.endpoints.classes}/mine`,
    );
    expect(pageRequest.request.params.get('shift')).toBe('MORNING');
    pageRequest.flush(buildPage([]));
  });

  it('should post the join payload to the entrar endpoint', () => {
    service.joinClass('AUT-2A').subscribe((schoolClass) => {
      expect(schoolClass.code).toBe('AUT-2A');
    });

    const joinRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'POST' && request.url === `${API_CONFIG.endpoints.classes}/join`,
    );
    expect(joinRequest.request.body).toEqual({ code: 'AUT-2A' });
    joinRequest.flush(buildClass());
  });

  it('should delete the leave and remove-student resources', () => {
    service.leaveClass(7).subscribe();
    const leaveRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'DELETE' && request.url === `${API_CONFIG.endpoints.classes}/7/leave`,
    );
    leaveRequest.flush(null);

    service.removeStudent(7, 9).subscribe();
    const removeRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'DELETE' &&
        request.url === `${API_CONFIG.endpoints.classes}/7/students/9`,
    );
    removeRequest.flush(null);
  });

  it('should post to the novo-codigo endpoint to regenerate the code', () => {
    service.regenerateClassCode(3).subscribe((schoolClass) => {
      expect(schoolClass.code).toBe('AUT-2A');
    });

    const regenerateRequest = httpTestingController.expectOne(
      (request) =>
        request.method === 'POST' && request.url === `${API_CONFIG.endpoints.classes}/3/new-code`,
    );
    expect(regenerateRequest.request.body).toEqual({});
    regenerateRequest.flush(buildClass());
  });

  it('should create classes with the payload in the body', () => {
    service.createClass({ name: 'Tuning Avancado', shift: 'SATURDAY' }).subscribe();

    const createRequest = httpTestingController.expectOne(
      (request) => request.method === 'POST' && request.url === API_CONFIG.endpoints.classes,
    );
    expect(createRequest.request.body).toEqual({ name: 'Tuning Avancado', shift: 'SATURDAY' });
    createRequest.flush(buildClass());
  });
});
