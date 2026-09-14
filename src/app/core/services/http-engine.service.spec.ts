import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEngineService } from './http-engine.service';
import { EngineModel } from '../models/engine.model';
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

  it('should fetch engines from GET /motores and set isSelected flag', () => {
    const mockApiResponse: EngineModel[] = [
      {
        id: 101,
        manufacturer: 'VOLKSWAGEN',
        name: 'AP 1.8 8V',
        description: 'Motor didático clássico.',
        displacementLiters: 1.8,
        displacementCc: 1781,
        compressionRatio: 9.2,
        rpmCutoff: 6500,
        aspirationType: 'ASPIRADO',
        createdAt: '2026-09-12T00:00:00.000Z'
      }
    ];

    service.getEngines().subscribe((engines) => {
      expect(engines.length).toBe(1);
      expect(engines[0].id).toBe(101);
      expect(engines[0].manufacturer).toBe('VOLKSWAGEN');
      expect(engines[0].name).toBe('AP 1.8 8V');
      expect(engines[0].aspirationType).toBe('ASPIRADO');
      expect(engines[0].displacementLiters).toBe(1.8);
      expect(engines[0].displacementCc).toBe(1781);
      expect(engines[0].compressionRatio).toBe(9.2);
      expect(engines[0].rpmCutoff).toBe(6500);
      expect(engines[0].isSelected).toBe(true);
    });

    const request = httpTestingController.expectOne(API_CONFIG.endpoints.motores);
    expect(request.request.method).toBe('GET');
    request.flush(mockApiResponse);
  });
});
