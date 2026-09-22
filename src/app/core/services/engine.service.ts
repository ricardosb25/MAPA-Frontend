import { Observable } from 'rxjs';
import { EngineModel, EnginePageQuery, EnginePayload, PageResponse } from '../models/engine.model';

export abstract class EngineService {
  abstract getEnginesPage(query: EnginePageQuery): Observable<PageResponse<EngineModel>>;
  abstract getSelectedEngine(): Observable<EngineModel | null>;
  abstract selectEngine(engineId: string): Observable<EngineModel>;
  abstract createEngine(payload: EnginePayload): Observable<EngineModel>;
  abstract updateEngine(engineId: string, payload: EnginePayload): Observable<EngineModel>;
  abstract deleteEngine(engineId: string): Observable<void>;
}
