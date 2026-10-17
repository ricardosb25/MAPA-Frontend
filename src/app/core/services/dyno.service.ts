import { Observable } from 'rxjs';
import { DynoResult, DynoTest } from '../models/dyno.model';

export abstract class DynoService {
  abstract runSimulation(): Observable<DynoResult>;
  abstract getHistory(): Observable<DynoTest[]>;
}
