import { Observable } from 'rxjs';
import { EcuMapCellUpdate, EcuMapGrid, EcuMapType } from '../models/ecu-map.model';

export abstract class EcuMapService {
  abstract getEngineMaps(engineId: string | number): Observable<EcuMapGrid[]>;
  abstract updateCell(
    engineId: string | number,
    mapType: EcuMapType,
    cellUpdate: EcuMapCellUpdate
  ): Observable<EcuMapGrid>;
  abstract restoreFactoryMap(engineId: string | number, mapType: EcuMapType): Observable<EcuMapGrid>;
}
