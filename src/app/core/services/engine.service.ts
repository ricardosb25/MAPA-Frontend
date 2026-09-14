import { Observable } from 'rxjs';
import { EngineModel } from '../models/engine.model';

export abstract class EngineService {
  abstract getEngines(): Observable<EngineModel[]>;
  abstract getSelectedEngine(): Observable<EngineModel | null>;
  abstract selectEngine(engineId: string): Observable<EngineModel>;
}
