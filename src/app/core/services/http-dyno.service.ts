import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynoResult, DynoTest } from '../models/dyno.model';
import { DynoService } from './dyno.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpDynoService implements DynoService {
  constructor(private readonly httpClient: HttpClient) {}

  runSimulation(): Observable<DynoResult> {
    return this.httpClient.post<DynoResult>(API_CONFIG.endpoints.dinamometro.executar, {});
  }

  getHistory(): Observable<DynoTest[]> {
    return this.httpClient.get<DynoTest[]>(API_CONFIG.endpoints.dinamometro.historico);
  }
}
