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

  const buildResult = (finalStatus: DynoResult['finalStatus'] = 'INTEGRO'): DynoResult => ({
    rpmAxis: [1000, 1250],
    powerCurve: [30.5, 41.2],
    torqueCurve: [11.5, 12.1],
    afrCurve: [13.8, 14.0],
    finalStatus,
    peakPower: 131.5,
    peakTorque: 15.7
  });

  const buildTest = (id: number): DynoTest => ({
    id,
    motorId: 101,
    maxPower: 131.5,
    maxTorque: 15.7,
    averageAfr: 14.1,
    finalStatus: 'INTEGRO',
    testedAt: '2026-10-16T10:00:00Z'
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
      expect(result.finalStatus).toBe('QUEBRADO_DETONACAO');
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
