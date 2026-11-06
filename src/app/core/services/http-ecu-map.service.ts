import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EcuMapCellUpdate, EcuMapGrid, EcuMapType } from '../models/ecu-map.model';
import { EcuMapService } from './ecu-map.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpEcuMapService implements EcuMapService {
  constructor(private readonly httpClient: HttpClient) {}

  getEngineMaps(engineId: string | number): Observable<EcuMapGrid[]> {
    return this.httpClient.get<EcuMapGrid[]>(API_CONFIG.buildEngineMapsUrl(engineId));
  }

  updateCell(
    engineId: string | number,
    mapType: EcuMapType,
    cellUpdate: EcuMapCellUpdate
  ): Observable<EcuMapGrid> {
    return this.httpClient.put<EcuMapGrid>(
      API_CONFIG.buildEngineMapCellUrl(engineId, mapType),
      cellUpdate
    );
  }

  restoreFactoryMap(engineId: string | number, mapType: EcuMapType): Observable<EcuMapGrid> {
    return this.httpClient.post<EcuMapGrid>(API_CONFIG.buildEngineMapRestoreUrl(engineId, mapType), {});
  }
}
