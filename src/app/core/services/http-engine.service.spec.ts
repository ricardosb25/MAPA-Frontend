import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEngineService } from './http-engine.service';
import {
  EngineModel,
  EnginePageQuery,
  EnginePayload,
  PageResponse
} from '../models/engine.model';
import { API_CONFIG } from '../config/api.config';

describe('HttpEngineService', () => {
  let service: HttpEngineService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpEngineService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HttpEngineService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const defaultQuery: EnginePageQuery = { page: 0, size: 12, sort: 'id,ASC' };

  const buildEngine = (overrides: Partial<EngineModel> = {}): EngineModel => ({
    id: 101,
    manufacturer: 'VOLKSWAGEN',
    name: 'AP 1.8 8V',
    description: 'Motor didático clássico.',
    displacementLiters: 1.8,
    displacementCc: 1781,
    compressionRatio: 9.2,
    rpmCutoff: 6500,
    aspirationType: 'ASPIRADO',
    createdAt: '2026-09-12T00:00:00.000Z',
    ...overrides
  });

  const buildPage = (content: EngineModel[]): PageResponse<EngineModel> => ({
    content,
    page: 0,
    size: 12,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
    sort: 'id: ASC'
  });

  const buildPayload = (): EnginePayload => ({
    manufacturer: 'HONDA',
    name: 'CG 160 Titan',
    description: 'Motor monocilíndrico de uso urbano.',
    displacementLiters: 0.2,
    displacementCc: 162,
    compressionRatio: 9.5,
    rpmCutoff: 8500,
    aspirationType: 'ASPIRADO'
  });

  const matchesEnginesPageRequest = (request: HttpRequest<unknown>): boolean =>
    request.method === 'GET' &&
    request.url === API_CONFIG.endpoints.motores &&
    request.params.get('page') === '0' &&
    request.params.get('size') === '12' &&
    request.params.get('sort') === 'id,ASC';

  it('should fetch engines with pagination query params and read the page envelope', () => {
    service.getEnginesPage(defaultQuery).subscribe((enginesPage) => {
      expect(enginesPage.content.length).toBe(1);
      expect(enginesPage.page).toBe(0);
      expect(enginesPage.size).toBe(12);
      expect(enginesPage.totalElements).toBe(1);
      expect(enginesPage.content[0].id).toBe(101);
      expect(enginesPage.content[0].name).toBe('AP 1.8 8V');
      expect(enginesPage.content[0].isSelected).toBe(false);
    });

    const pageRequest = httpTestingController.expectOne(matchesEnginesPageRequest);
    pageRequest.flush(buildPage([buildEngine()]));
  });

  it('should select an engine by id and keep the flag on a later page fetch', () => {
    service.selectEngine('101').subscribe((selectedEngine) => {
      expect(selectedEngine.id).toBe(101);
      expect(selectedEngine.isSelected).toBe(true);
    });

    httpTestingController.expectOne(API_CONFIG.buildEngineByIdUrl(101)).flush(buildEngine());

    service.getEnginesPage(defaultQuery).subscribe((enginesPage) => {
      expect(enginesPage.content[0].isSelected).toBe(true);
    });

    httpTestingController.expectOne(matchesEnginesPageRequest).flush(buildPage([buildEngine()]));
  });

  it('should return null without any request when no engine is selected', () => {
    service.getSelectedEngine().subscribe((selectedEngine) => {
      expect(selectedEngine).toBeNull();
    });

    httpTestingController.expectNone(API_CONFIG.buildEngineByIdUrl(101));
  });

  it('should create an engine with POST on the collection endpoint', () => {
    const payload = buildPayload();

    service.createEngine(payload).subscribe((createdEngine) => {
      expect(createdEngine.id).toBe(202);
      expect(createdEngine.name).toBe(payload.name);
      expect(createdEngine.manufacturer).toBe(payload.manufacturer);
    });

    const createRequest = httpTestingController.expectOne(API_CONFIG.endpoints.motores);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual(payload);
    createRequest.flush(buildEngine({ id: 202, name: payload.name, manufacturer: payload.manufacturer }));
  });

  it('should update an engine with PUT on the id endpoint', () => {
    const payload = buildPayload();

    service.updateEngine('101', payload).subscribe((updatedEngine) => {
      expect(updatedEngine.id).toBe(101);
      expect(updatedEngine.name).toBe(payload.name);
    });

    const updateRequest = httpTestingController.expectOne(API_CONFIG.buildEngineByIdUrl(101));
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual(payload);
    updateRequest.flush(buildEngine({ name: payload.name }));
  });

  it('should delete an engine with DELETE and clear the current selection', () => {
    service.selectEngine('101').subscribe();
    httpTestingController.expectOne(API_CONFIG.buildEngineByIdUrl(101)).flush(buildEngine());

    let deletionCompleted = false;

    service.deleteEngine('101').subscribe(() => {
      deletionCompleted = true;
    });

    const deleteRequest = httpTestingController.expectOne(API_CONFIG.buildEngineByIdUrl(101));
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null, { status: 204, statusText: 'No Content' });
    expect(deletionCompleted).toBe(true);

    service.getSelectedEngine().subscribe((selectedEngine) => {
      expect(selectedEngine).toBeNull();
    });

    httpTestingController.expectNone(API_CONFIG.buildEngineByIdUrl(101));
  });
});
