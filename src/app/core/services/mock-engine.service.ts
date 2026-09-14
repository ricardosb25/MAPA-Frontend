import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { EngineModel } from '../models/engine.model';
import { EngineService } from './engine.service';

@Injectable({
  providedIn: 'root'
})
export class MockEngineService implements EngineService {
  private initialEngines: EngineModel[] = [
    {
      id: 1,
      manufacturer: 'VOLKSWAGEN',
      name: 'AP 1.8 8V',
      aspirationType: 'ASPIRADO',
      description: 'Motor didático clássico. Ideal para a primeira calibração de ignição.',
      displacementLiters: 1.8,
      displacementCc: 1781,
      compressionRatio: 9.2,
      rpmCutoff: 6500,
      createdAt: '2026-09-12T00:00:00.000Z',
      isSelected: true
    },
    {
      id: 2,
      manufacturer: 'VOLKSWAGEN',
      name: 'EA888 2.0 TSI',
      aspirationType: 'TURBO',
      description: 'Injeção direta e turbo twin-scroll. Cuidado com detonação em carga alta.',
      displacementLiters: 2.0,
      displacementCc: 1984,
      compressionRatio: 9.6,
      rpmCutoff: 6800,
      createdAt: '2026-09-12T00:00:00.000Z',
      isSelected: false
    }
  ];

  private enginesSubject = new BehaviorSubject<EngineModel[]>(this.initialEngines);

  getEngines(): Observable<EngineModel[]> {
    return this.enginesSubject.asObservable();
  }

  getSelectedEngine(): Observable<EngineModel | null> {
    const currentEngines = this.enginesSubject.getValue();
    const selectedEngine = currentEngines.find((engine) => engine.isSelected) || null;
    return of(selectedEngine);
  }

  selectEngine(engineId: string): Observable<EngineModel> {
    const currentEngines = this.enginesSubject.getValue();
    let newlySelectedEngine: EngineModel | undefined;

    const updatedEngines = currentEngines.map((engine) => {
      if (engine.id.toString() === engineId) {
        newlySelectedEngine = { ...engine, isSelected: true };
        return newlySelectedEngine;
      }
      return { ...engine, isSelected: false };
    });

    if (!newlySelectedEngine) {
      return throwError(() => new Error(`Engine with ID ${engineId} not found.`));
    }

    this.enginesSubject.next(updatedEngines);
    return of(newlySelectedEngine);
  }
}
