import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpDynoService } from './http-dyno.service';
import { DynoResult, DynoTest } from '../models/dyno.model';
import { API_CONFIG } from '../config/api.config';

describe('HttpDynoService', () => {
  let service: HttpDynoService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpDynoService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(HttpDynoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const buildResult = (statusFinal: DynoResult['statusFinal'] = 'INTEGRO'): DynoResult => ({
    rpmEixoX: [1000, 1250],
    curvaPotencia: [30.5, 41.2],
    curvaTorque: [11.5, 12.1],
    curvaAfr: [13.8, 14.0],
    statusFinal,
    picoPotencia: 131.5,
    picoTorque: 15.7
  });

  const buildTest = (id: number): DynoTest => ({
    id,
    motorId: 101,
    potenciaMaxima: 131.5,
    torqueMaximo: 15.7,
    afrMedio: 14.1,
    statusFinal: 'INTEGRO',
    dataTeste: '2026-10-16T10:00:00Z'
  });

  it('should POST the simulation to the executar endpoint', () => {
    const expectedResult = buildResult();

    service.runSimulation().subscribe((result) => {
      expect(result).toEqual(expectedResult);
    });

    const request = httpTestingController.expectOne(API_CONFIG.endpoints.dinamometro.executar);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush(expectedResult);
  });

  it('should keep the broken status returned by the backend', () => {
    const expectedResult = buildResult('QUEBRADO_DETONACAO');

    service.runSimulation().subscribe((result) => {
      expect(result.statusFinal).toBe('QUEBRADO_DETONACAO');
    });

    const request = httpTestingController.expectOne(API_CONFIG.endpoints.dinamometro.executar);
    request.flush(expectedResult);
  });

  it('should GET the history endpoint', () => {
    const expectedHistory = [buildTest(9), buildTest(8)];

    service.getHistory().subscribe((history) => {
      expect(history).toEqual(expectedHistory);
      expect(history).toHaveLength(2);
    });

    const request = httpTestingController.expectOne(API_CONFIG.endpoints.dinamometro.historico);
    expect(request.request.method).toBe('GET');
    request.flush(expectedHistory);
  });
});
